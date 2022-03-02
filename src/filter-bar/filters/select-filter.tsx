import React from 'react';
import { filter } from 'lodash';
import Select from 'react-select';

// Local imports
import { ActionMeta, ValueType } from 'react-select/lib/types';
import { Styles } from 'react-select/lib/styles';
import { FilterQuery, FilterQueryField, Operations, Logics } from 'filter-query-language-core';
import { FilterProps, IDefaultFilterProps, IGetDefaultFilterQuery } from '../filter-bar';

type MultiSelectFilterProps = {
    options: Option[],
    styles?: Partial<Styles>,
    isMulti?: boolean
}

export type Option = {
    value: string,
    option: string,
}

export const getDefaultFilterQuery = <Tobj extends {}>(field: FilterQueryField<Tobj>): FilterQuery<Tobj> => ({
    field,
    logic: Logics.OR,
    filterItems: [],
});

export class SelectFilter<Tobj> extends React.PureComponent<FilterProps<Tobj, MultiSelectFilterProps>> {
    public static defaultProps: IGetDefaultFilterQuery<IDefaultFilterProps> = {
        getDefaultFilterQuery,
    }

    onChangeValue: (values: ValueType<Option>, action: ActionMeta) => void = (values) => {
        const { onFilterUpdate, field: field } = this.props;
        const filterItems = (values && Array.isArray(values)) ? values.map(value => ({
            operation: Operations.EQ,
            value: value.value,
        })) : [{
            operation: Operations.EQ,
            value: values && (values as Option).value,
        }];

        onFilterUpdate && onFilterUpdate({
            field,
            logic: Logics.OR,
            filterItems,
        });
    }

    render() {
        const { filterQuery, options, styles, isMulti } = this.props;
        const value = !!filterQuery ? filterQuery.filterItems.map(f => f.value as string) : [];

        return (
            <div className="w-100">
                <Select
                    isMulti={isMulti}
                    styles={styles}
                    options={options}
                    getOptionLabel={o => o.option}
                    getOptionValue={o => o.value}
                    value={filter(options, (o) => value.includes(o.value))}
                    onChange={this.onChangeValue}
                />
            </div>
        );
    }
}

export const customStyles = {
    control: (styles: {}) => ({
        ...styles,
        minHeight: '34px',
        minWidth: '16em',
    }),
    clearIndicator: (styles: {}) => ({
        ...styles,
        padding: '2px 8px',
    }),
    dropdownIndicator: (styles: {}) => ({
        ...styles,
        padding: '2px 8px',
    }),
    loadingIndicator: (styles: {}) => ({
        ...styles,
        padding: '2px 8px',
    }),
    menu: (styles: {}) => ({
        ...styles,
        zIndex: 3, // Without this menu will be overlapped by other fields
    }),
}