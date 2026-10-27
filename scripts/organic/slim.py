# Turns the USDA Organic Integrity monthly workbook ("Operation Level" sheet) into a slim
# lookup of US certified operations: data/organic/us-operations.json.
# Usage: python scripts/organic/slim.py <workbook.xlsx> <snapshot YYYYMMDD> <out.json>
import json, sys
import pandas as pd

src, snap, out = sys.argv[1], sys.argv[2], sys.argv[3]
cols = {
    'op_nopOpID': 'id', 'op_name': 'name', 'op_otherNames': 'other_names', 'Cert_name': 'certifier',
    'op_status': 'status', 'opSC_LS': 'livestock', 'opSC_HANDLING': 'handling', 'opSC_CR': 'crops',
    'opPA_city': 'city', 'opPA_state': 'state', 'opPA_country': 'country', 'op_url': 'website',
    'opEx_dairy': 'dairy', 'op_certificate': 'certificate',
}
df = pd.read_excel(src, sheet_name='Operation Level', usecols=list(cols), dtype=str).fillna('')
df = df.iloc[1:]  # second header row holds human-readable labels
df = df.rename(columns=cols)
df = df[df['country'].str.contains('United States', case=False, na=False)]
df = df[df['status'].str.strip().eq('Certified')]
df = df.drop(columns=['country', 'certificate'])
# Item-level detail: what each operation's certification actually covers.
items = pd.read_excel(src, sheet_name='Item Level', usecols=['ci_nopOpID', 'ci_nopScope', 'ci_nopCatName', 'ci_itemList', 'ci_status'], dtype=str).fillna('').iloc[1:]
items = items[items['ci_status'].str.contains('Certified', case=False) & items['ci_nopOpID'].isin(set(df['id']))]
text = (items['ci_nopCatName'] + ' ' + items['ci_itemList']).str.lower()
pasture = items[items['ci_nopScope'].str.upper().str.contains('CROPS') & text.str.contains(r'pasture|grass|hay|forage|haylage', regex=True)]
DAIRY = {'milk': r'\bmilk\b', 'raw-milk': r'raw milk', 'cheese': r'cheese', 'butter': r'butter(?!milk)', 'yogurt': r'yog', 'cream': r'\bcream\b', 'kefir': r'kefir', 'ghee': r'ghee', 'ice-cream': r'ice cream|gelato'}
handling = items[items['ci_nopScope'].str.upper().str.contains('HANDLING')]
htext = (handling['ci_nopCatName'] + ' ' + handling['ci_itemList']).str.lower()
dairy_items = {}
for oid, t in zip(handling['ci_nopOpID'], htext):
    for k, rx in DAIRY.items():
        if pd.Series([t]).str.contains(rx, regex=True).iloc[0]:
            dairy_items.setdefault(oid, set()).add(k)
pasture_ids = set(pasture['ci_nopOpID'])
df['organic_pasture'] = df['id'].isin(pasture_ids)
df['organic_dairy_products'] = df['id'].map(lambda i: sorted(dairy_items.get(i, [])))
ops = df.to_dict(orient='records')
for o in ops:
    if not o['organic_pasture']: del o['organic_pasture']
    if not o['organic_dairy_products']: del o['organic_dairy_products']
json.dump({
    'snapshot': f'{snap[:4]}-{snap[4:6]}-{snap[6:]}',
    'source_url': 'https://organic.ams.usda.gov/integrity/Reports/DataHistory',
    'count': len(ops),
    'operations': ops,
}, open(out, 'w'), separators=(',', ':'))
print('wrote', len(ops), 'US operations to', out)
