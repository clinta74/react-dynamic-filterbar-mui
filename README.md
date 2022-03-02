# React Dynamic Filter Bar
A component that provides a filters to the user in a way that can added or 
remove form the bar. The user is presented with a list of available filters 
in a list.  Choosing a filter adds it to the bar with the option to then
remove that filter.  Those filters present the user with the fields or selections
that allow the user to configure the values and operations of that filter.

You can view the [demo](https://clinta74.github.io/react-dynamic-filterbar-bootstrap/).

## Install
``` 
npm install react-dynamic-filterbar-bootstrap
```

## Usage
Add your filterbar to the page and handle the updateF

``` javascript
import { Filters, FilterBar, ChangeFQLHander } from 'react-dynamic-filterbar';
import { StringFilter, NumericFilter, SelectFilter, DateFilter } from 'react-dynamic-filterbar/filter-bar';
type AppProps = {};
type AppState = {
    fql?: FilterBars.FilterQueryLanguage<MyData>,
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
      super(props);
      this.state = {
          fql: undefined,
      }
  }

  onFilterUpdate: ChangeFQLHander<MyData> = (fql) => {
      this.setState({ fql });
  }

  render() {
  return (
    <FilterBar onFilterUpdate={this.onFilterUpdate} fql={fql} buttonClassName="btn">
      <StringFilter field={['firstName', 'lastName']} label="Name" className="form-control" buttonClassName="btn btn-primary" />
      <StringFilter field="comment" label="Comment" className="form-control" buttonClassName="btn btn-primary" showOperator />
      <NumericFilter field="amount" label="Amount" className="form-control" />
      <SelectFilter field="color" label="Colors" options={colorOptions} styles={customStyles} isMulti />
      <DateFilter field="birthday" label="Birthday" showOperator buttonClassName="btn btn-primary" shown/>
    </FilterBar>);
  }
}
```

## Filter Options
### Filter Bar
- onFilterUpdate - Event Handler called when any filters update the FQL.
- fql - The FQL data to be displayed by the filters in the filter bar.
- buttonClassName - Class to be applied the add filter dropdown of the filter bar.
### Common
- field - The field the filter applies to.
- label - The string used to represent the filter. Used in the add fitler and filter labels.
- shown - The filter is added at page load with default values.
### String and Number
- showOperator - Show a dropdown to choose what operation to be applied.
- buttonClassName - Class to be applied the operartion dropdown of the filter.
- className - Class applied the the input element.
### Select (react-select)
- isMulti - Make the select a multi-select box.
- options - The options list provided as an array of { value: string, option: string }.
- styles - Style object to pass to react-select control.

## Understanding Filter Query Language (FQL)
FQL is designed to be a normalized definition of filters that can be applied to a dataset in a serializable format.  The format
allows for flexable filter configuration that still includes order of filter application and nested properties. This result is an
object that can represent the WHERE clause of a SQL while keeping the information needed to display the filters.

``` javascript
  FQL = { // The base FQL wrapping object.
    logic: AND, // AND | OR - Used to represent how multiple filters are grouped together. (Default: AND)
    filterQueries: [ 
      logic: OR, // Logic used to join filter values on a property together and multiple filters.
      field: 'name', // The property or field to be filtered on. Can be array of fields or nested fields. ex ['user.firstName', 'user.lastName']
      filterItems: [{
        operation: EQ, // Logic used in the comparison operation.
        value: 'Jim' // The value to check against.
      }]
    ]
  }
```
As SQL
``` sql
SELECT * FROM USER WHERE [name] = 'Jim';
```

``` javascript
// The base FQL wrapping object.
const fql = {
    logic: 'AND',
    filterQueries: [
        {
            logic: 'OR',
            field: 'comment',
            filterItems: [{
                operation: 'CONTAINS',
                value: 'Test'
            }]
        },
        {
            logic: 'OR',
            field: 'color',
            filterItems: [{
                operation: 'EQ',
                value: 'red'
            }, {
                operation: 'EQ',
                value: 'blue'
            }]
        }
    ]
}
```
As SQL
``` sql
SELECT * FROM USER WHERE [comment] LIKE '%Test%' AND ([color] = 'red' OR [color] = 'blue');
SELECT * FROM USER WHERE [comment] LIKE '%Test%' AND ([color] IN ('red', 'blue'));
```

#### Examples
Text filter added for a name.
- Input to type in string to filter on.
- Optionally select filter logic.
  - Contains
  - Equals (An exact match)
  - Starts with
  - Ends with
  - Does not contain
- Optionally provide case sensitivity.  (Preferred case insensitivity.)

## Custom Filters
You can make your own custom filter. The filter is responsable for consuming its part of filter query and calling the event handler when that filter query has changed.  The filter is wrapped in a control that supplies a remove link.
