const fs = require('fs');
const shell = require('shelljs');
const YAML = require('yaml');
const argv = require('minimist')(process.argv.slice(2));

const ENCODING = 'utf8';

let getFilePaths = function(path) {
  let filePaths = fs.readdirSync(path);
  filePaths.forEach(function(file, index, array) {
    array[index] = `${__dirname}/configs/${file}`;
  });
  return filePaths;
}

let getModels = function(filePaths) {
  let files = [];
  filePaths.forEach(function(filePath) {
    try {
      model = YAML.parse(readYamlSync(filePath));
      files.push(model);
    } 
    catch (error) {
      console.error(`error parsing file to yaml: ${filePath}`);
    }
  });
  return files;
}

let modelOptions = function(model) {
  let keyValString = [];

  model.forEach(function(value) {
    keyValString.push(`${value.attribute}:${value.type}`);
  });

  return keyValString.join(' ');
}

let readYamlSync = function(path) {
  return fs.readFileSync(path, ENCODING, function(err, contents) {
    if (err) {
      return err;
    }
  });
}

let runGenerators = function(configs, mirage) {
  configs.forEach(function(config) {
    let options = modelOptions(config.options);
    if (shell.exec(`ember g model ${config.modelName} ${options}`).code !== 0) {
      shell.echo(`error creating model ${config.modelName}`);
      shell.exit(1);
    }
    if (mirage) {
      if (shell.exec(`ember g mirage-model ${config.modelName}`).code !== 0) {
        shell.echo(`error creating mirage-model for model ${config.modelName}`);
        shell.exit(1);
      }
      if (shell.exec(`ember g mirage-factory ${config.modelName}`).code !== 0) {
        shell.echo(`error creating mirage-factory for model ${config.modelName}`);
        shell.exit(1);
      }
    }
  });
}

let run = function() {
  let path = argv.path;
  let mirage = argv.mirage;
  let filePaths = getFilePaths(path);
  let models = getModels(filePaths);
  runGenerators(models, mirage);
};

run();
