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
ops = df.to_dict(orient='records')
json.dump({
    'snapshot': f'{snap[:4]}-{snap[4:6]}-{snap[6:]}',
    'source_url': 'https://organic.ams.usda.gov/integrity/Reports/DataHistory',
    'count': len(ops),
    'operations': ops,
}, open(out, 'w'), separators=(',', ':'))
print('wrote', len(ops), 'US operations to', out)
