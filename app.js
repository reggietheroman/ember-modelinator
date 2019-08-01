const fs = require('fs');
const shell = require('shelljs');
const YAML = require('yaml');

let runGenerators = function(configs) {
  configs.forEach(function(config) {
    let options = modelOptions(config.options);
    shell.echo(`ember g ${config.modelName} ${options}`);
  });
}

let modelOptions = function(model) {
  let keyValString = [];

  model.forEach(function(value) {
    keyValString.push(`${value.attribute}:${value.type}`);
  });

  return keyValString.join(' ');
}

let readYaml = function(path) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path, 'utf8', function(err, contents) {
      if (err) {
        reject(err);
      }
      console.info('file read successfully');
      resolve(YAML.parse(contents));
    });
  });
}

readYaml('configs/user.yml')
  .then(function(data) {
    runGenerators([data]);
  })
  .catch(function(err) {
    console.error('oh nooo');
    console.error(err);
  });
