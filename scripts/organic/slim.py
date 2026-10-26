# Turns the downloaded Organic Integrity workbook into data/organic/us-operations.json:
# one row per US certified operation with the fields our matcher needs.
import json, sys, re
import pandas as pd

info = json.load(open('download.json'))
xl = pd.ExcelFile(info['file'])
report = {'source': info, 'sheets': {}}
for sh in xl.sheet_names:
    head = pd.read_excel(xl, sh, nrows=3)
    report['sheets'][sh] = {'columns': [str(c) for c in head.columns], 'sample': head.astype(str).values.tolist()}
json.dump(report, open('columns.json', 'w'), indent=2)

def pick(cols, *keys):
    for k in keys:
        for c in cols:
            if k in c.lower().replace(' ', ''):
                return c
    return None

# Use the sheet with operation names; it has the most columns matching ours.
best = None
for sh in xl.sheet_names:
    cols = report['sheets'][sh]['columns']
    if pick(cols, 'operationname', 'operation') and pick(cols, 'state'):
        best = sh; break
if best is None:
    print('could not find operations sheet', report); sys.exit(1)
df = pd.read_excel(xl, best, dtype=str).fillna('')
cols = list(df.columns)
c = {
  'id': pick(cols, 'operationid', 'nopid', 'id'),
  'name': pick(cols, 'operationname', 'operation'),
  'other_names': pick(cols, 'othernames', 'dba'),
  'city': pick(cols, 'physicaladdresscity', 'city'),
  'state': pick(cols, 'physicaladdressstate', 'state'),
  'country': pick(cols, 'physicaladdresscountry', 'country'),
  'certifier': pick(cols, 'certifiername', 'certifier'),
  'status': pick(cols, 'operationcertificationstatus', 'status'),
  'livestock': pick(cols, 'livestockscopecertificationstatus', 'livestock'),
  'handling': pick(cols, 'handlingscopecertificationstatus', 'handling'),
  'website': pick(cols, 'website', 'url'),
}
print('column map', c)
rows = []
for _, r in df.iterrows():
    get = lambda k: (r[c[k]].strip() if c[k] else '')
    country = get('country')
    if country and not re.search(r'united states|^us$|^usa$', country, re.I):
        continue
    rows.append({k: get(k) for k in c if c[k] and k != 'country'})
out = {'snapshot': info['date'], 'source_url': 'https://organic.ams.usda.gov/integrity/Reports/DataHistory', 'columns': c, 'count': len(rows), 'operations': rows}
import os
os.makedirs('out', exist_ok=True)
json.dump(out, open('out/us-operations.json', 'w'), separators=(',', ':'))
json.dump(report, open('out/columns.json', 'w'), indent=2)
print('wrote', len(rows), 'US operations')
