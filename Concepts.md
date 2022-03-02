# Dynamic Filter Bar Concepts

## Goals
- Be able to have a filter bar where the user can add and remove filters as needed out of a list of predefined filters.
- Filters are defined by configuration by providing composed filters or auto generated filters based on schema.
- Filters return their filter query language (FQL) or object.
- Each filter should be able to accept its own FQL to be able to render.

```
const testFilter = {};

const FQL = [ filters: [{ 
  logic: OR,
  filterItems: [ ...fitlerItem ]
}]
]

filerItem = {
  field: 'veritcal',
  operator: 'EQ',
  value: 'sneaker',
}

const textFilter.opsFn = { 
  EQ: (a, b) => moment(a).equals(b)
}

function filterIt(data, fitlerItem) {
  return opsFn[fitlerItem.operator](data[fitlerItem.field], filterItems.value)
}

const dataSet = []
dataSet.filter(i => filterIt(i, fitlerItem))

<FilterBar onFilterChange={}  >
  <TextFilter display field="verical" onFilterChange/>

</FilterBar>
```
