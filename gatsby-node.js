const fs = require('fs');
const yaml = require('js-yaml');

exports.createPages = ({ actions }) => {
  const { createPage } = actions;
  const datasets = yaml.load(fs.readFileSync('./datasets/datasets.yml', 'utf-8'));

  datasets.forEach((dataset) => {
    createPage({
      path: `/${dataset.code}`,
      component: require.resolve('./src/dynamic-pages/search.jsx'),
      context: {
        dataset,
      },
    });
  });
};
