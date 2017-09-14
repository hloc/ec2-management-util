(() => {
  const Promise = require('bluebird');
  const AWS = require('aws-sdk');
  let ec2;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const region = process.env.AWS_DEFAULT_REGION;

  const arguments = process.argv;

  if (arguments.length > 2 && arguments[2]) {
    AWS.config.update({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      }
    });
    ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
    // ec2 = Promise.promisifyAll(ec2);
    const command = arguments[2];

    switch (command.toLowerCase()) {
      case 'start': {
        startInstance();
        break;
      }
      case 'stop': {
        stopInstance();
        break;
      }
      case 'info': {
        displayInstances();
        break;
      }
      default:
        displayInstances();
    }
  } else {
    console.log('Missing command');
  }

  function startInstance() {
    let terminateFlag = false;
    let instanceId;
    let dns;
    let promisifyDesc = Promise.promisify(ec2.describeInstances);
    promisifyDesc = promisifyDesc.bind(ec2);
    let promisifyStart = Promise.promisify(ec2.startInstances);
    promisifyStart = promisifyStart.bind(ec2);

    promisifyDesc({})
      .then(data => {
        console.log('########### start result ', JSON.stringify(data));

        const instance = data.Reservations[0].Instances[0];
        instanceId = instance.InstanceId;

        return promisifyStart({
          InstanceIds: [instanceId]
        });
      })
      .then(result => {
        console.log('########### start result ', JSON.stringify(result));
        const filter = {
          InstanceIds: [
            instanceId,
          ],
        };

        return promisifyDesc();
      })
      .then(result => {
        console.log('######### post start', JSON.stringify(result));
        const instance = result.Reservations[0].Instances[0];
        dns = instance.PublicDnsName;

        console.log('start instance id', instance.InstanceId);           // successful response
        console.log('dns', dns);           // successful response
        console.log(`ssh -i unbuntu@${dns} -D 11080`)
      })
      .catch(err => {
        console.log(err, err.stack); // an error occurred
      })
      .then(() => {
        terminateFlag = true;
      });

    let t;
    function nt() {
      if (!terminateFlag) {
        t = setTimeout(nt, 1000);
      }
    }
    nt();
  }

  function stopInstance() {
    let terminateFlag = false;
    let instanceId;
    let dns;
    let promisifyDesc = Promise.promisify(ec2.describeInstances);
    promisifyDesc = promisifyDesc.bind(ec2);
    let promisifyStop = Promise.promisify(ec2.stopInstances);
    promisifyStop = promisifyStop.bind(ec2);

    promisifyDesc({})
      .then(data => {
        const instance = data.Reservations[0].Instances[0];
        instanceId = instance.InstanceId;
        dns = instance.PublicDnsName;

        console.log('stop instance id', instance.InstanceId);           // successful response
        console.log('dns', instance.PublicDnsName);           // successful response

        return promisifyStop({
          InstanceIds: [instanceId]
        });
      })
      .then(result => {
        console.log('stop result', JSON.stringify(result));
      })
      .catch(err => {
        console.log(err, err.stack); // an error occurred
      })
      .then(() => {
        terminateFlag = true;
      });

    let t;
    function nt() {
      if (!terminateFlag) {
        t = setTimeout(nt, 1000);
      }
    }
    nt();
  }

  function displayInstances() {
    let terminateFlag = false;
    let dns;
    let promisifyDesc = Promise.promisify(ec2.describeInstances);
    promisifyDesc = promisifyDesc.bind(ec2);

    promisifyDesc({})
      .then(data => {
        const instance = data.Reservations[0].Instances[0];
        dns = instance.PublicDnsName;
        console.log(`ssh -i ~/.ssh/ec2sock.pem ec2-user@${dns} -D 11080`)
      })
      .catch(err => {
        console.log(err, err.stack); // an error occurred
      })
      .then(() => {
        terminateFlag = true;
      });

    let t;
    function nt() {
      if (!terminateFlag) {
        t = setTimeout(nt, 1000);
      }
    }
    nt();
  }
})()
