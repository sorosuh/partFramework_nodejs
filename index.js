/**
 * Created by Nasser on 9/3/2017.
 */

let PartFramework = require('partFramework');
let envMode = process.env.mode || process.env.MODE || 'dev';
let frameworkConfig = require('./project-config-' + envMode + '.js').frameworkConfig;

if (!process.env.hasOwnProperty('mode') && !process.env.hasOwnProperty('MODE')) {
  console.log('Warning!\nNo environment variable `mode` or `MODE` was provided.');
  console.log('Loading configurations for `dev` mood as default.\n\n');
}

let partFramework = new PartFramework(frameworkConfig);
partFramework.run();

exports.partFramework = partFramework;