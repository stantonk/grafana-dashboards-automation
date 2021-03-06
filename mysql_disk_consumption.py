import StringIO
import json
import sys

from grafanalib._gen import write_dashboard
from grafanalib.core import Dashboard, BYTES_FORMAT, SHORT_FORMAT, Time
from grafanalib.core import YAxis
from grafanalib.core import Row
from grafanalib.core import Graph
from grafanalib.core import Target

import requests

import boto3

# See:
# http://docs.grafana.org/http_api/dashboard/
# https://github.com/weaveworks/grafanalib
#


client = boto3.client('ec2')
instances = client.describe_instances()
print instances


GRAFANA_API_URL = 'http://statsd:3000/api/dashboards/db/'

target = Target(target='servers.prod-mysql-maindb*.df-data.df_complex-used', datasource='default')

panel = Graph(title='mysql-maindb disk consumption',
              dataSource='default',
              targets=[target],
              yAxes=[
                  YAxis(format=BYTES_FORMAT),
                  YAxis(format=SHORT_FORMAT),
              ],
              )

row = Row(panels=[panel])

db = Dashboard(title='Autogenerated MySQL Disk Consumption',
               rows=[row],
               time=Time('now-6M', 'now'),
               )

s = StringIO.StringIO()
write_dashboard(db, s)
dashboard_json = s.getvalue()
print dashboard_json

payload = {
    "dashboard": json.loads(dashboard_json),
    "overwrite": True
    # "folderId": 0,
}

r = requests.post(GRAFANA_API_URL, json=payload)
if r.ok:
    print r.content
else:
    print 'error: %s (%s)' % (r.content, r.status_code)
