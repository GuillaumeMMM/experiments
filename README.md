# Dev experiments

For now this repo only contains experiments using [d3.js](https://d3js.org/) along with the [data-navigator](https://dig.cmu.edu/data-navigator/) library in order to make data visualizations more accessible.

These are only experiments. As such they do not always meet accessibility requirements from [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/), [EN 301 549](https://accessible-eu-centre.ec.europa.eu/content-corner/digital-library/en-3015492021-accessibility-requirements-ict-products-and-services_en) or [Chartability](https://chartability.github.io/POUR-CAF/).

[Have a look at the the demo](https://experiments.guillaumemeigniez.me/)

## Run the examples locally

```
npm install
npm start
```

## Next steps

- [x] Extract data-navigator lifecycle in util function
- [ ] Create a reusable web-component for keyboard instructions
- [x] Make sure the navigation with data-navigator triggers the same visual info as a mouse navigation (tooltips)
- [ ] Add a sankey diagram
- [ ] Add a polar area chart
- [ ] Add a stacked area chart
