var AWS = require('aws-sdk');
var grafana = require('grafana-dash-gen');
var Row = grafana.Row;
var Dashboard = grafana.Dashboard;
var Panels = grafana.Panels;
var Target = grafana.Target;
var Templates = grafana.Templates;

AWS.config.region = 'us-east-1';

grafana.configure({
    url: 'http://statsd:3000/api/dashboards/db/'
    //cookie: 'auth-openid=REPLACETOKENIFAPPLICABLE'
});

var dashboard = new Dashboard({
  title: 'Auto-generated MySQL Clusters Disk Consumption',
  timezone: 'UTC',
  time: {
    from: 'now-6M',
    to: 'now'
  }
});

var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

var params = {
  Filters: [{
    Name: "tag:Name",
    Values: ["prod-mysql*"]
  }]
};
ec2.describeInstances(params, function(err, data) {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data);
    data.Reservations.forEach(function(element, i) {
      var tags = element.Instances[0].Tags;
      tags.forEach(function(tag, j) {
        if (tag.Key === 'Name') {
          console.log(i + " " + tag.Value);
        }
      });
    });
  }
});

//var mysqlMaindbRow = new Row();

//var panel = new Panels.Graph({
  //title: 'mysql-maindb disk consumption',
  //span: 12,
  //targets: [
    //new Target('servers.prod-mysql-maindb*.df-data.df_complex-used')
  //],
  //datasource: 'default' // graphite is our default datasource
//});

//mysqlMaindbRow.addPanel(panel);
//dashboard.addRow(mysqlMaindbRow);

//// Y U NO WORK :(  dashboard.generate());
//grafana.publish(dashboard);
