const path = require('path');

module.exports = {
  baseUrl: '/tomvizweb',
  work: './build-tmp',
  examples: [],
  config: {
    title: 'tomviz web',
    description: '"Visualization Toolkit for the Web."',
    subtitle: '"Enable scientific visualization to the Web."',
    author: 'Kitware Inc.',
    timezone: 'UTC',
    url: 'https://OpenChemistry.github.io/tomvizweb',
    root: '/tomvizweb/',
    github: 'OpenChemistry/tomvizweb',
  },
  copy: [
    { src: '../Data/*', dest: './build-tmp/public/data' },
    { src: '../Distribution/*', dest: './build-tmp/public/data/js' },
  ],
};
