(() => {
  const AWS = require('aws-sdk');
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const region = process.env.AWS_DEFAULT_REGION;


  AWS.config.update({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    }
  });

  const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
  let terminateFlag = false;
  const ec2Request = ec2.describeInstances({}, function(err, data) {
    terminateFlag = true;
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {
      const instance = data.Reservations[0].Instances[0];
      console.log('result', data.Reservations[0].Instances);           // successful response
      console.log(`ssh -i unbuntu@ ${instance.PublicDnsName} -D 11080`)
    }
  });

  let t;
  function nt() {
    console.log('Terminate: ', terminateFlag);
    if (!terminateFlag) {
      t = setTimeout(nt, 1000);
    }
  }
  nt();
})()
