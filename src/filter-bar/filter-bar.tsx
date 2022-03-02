import React from 'react';

// Local imports
import { FilterItem } from './filter-item';
import { Dropdown } from '../dropdown/dropdown';
import classNames from 'classnames';
import { FilterQuery, FilterQueryField, FilterQueryLanguage, Logics } from 'filter-query-language-core';

export type ChangeFQLHander<Tobj> = (fql: FilterQueryLanguage<Tobj>) => void;
export type RemoveFilterHandler<Tobj> = (field: FilterQueryField<Tobj>) => void;
export type GetDefaultFilterQueryHandler<Tobj> = (field: FilterQueryField<Tobj>) => FilterQuery<Tobj>;

export type FilterUpdateHandler<Tobj> = (filterQuery: FilterQuery<Tobj>) => void;

export interface IGetDefaultFilterQuery<Tobj> {
    getDefaultFilterQuery?: GetDefaultFilterQueryHandler<Tobj>,
}

export interface IDefaultFilterProps {
    getDefaultFilterQuery: () => void;
}

export type FilterProps<Tobj, Props = {}> = {
    label: string;
    field: FilterQueryField<Tobj>,
    labelClassName?: string,
    filterQuery?: FilterQuery<Tobj>,
    onFilterUpdate?: FilterUpdateHandler<Tobj>,
    shown?: boolean,
} & Props & IGetDefaultFilterQuery<Tobj>;

type FilterBarProps<Tobj> = {
    onFilterUpdate: ChangeFQLHander<Tobj>,
    fql: FilterQueryLanguage<Tobj> | undefined,
    className?: string,
    labelClassName?: string,
    buttonClassName?: string,
    filterItemClassName?: string,
};

type FilterBarState = {
    showMenu: boolean
}

type FilterElement<Tobj> = React.ReactElement<FilterProps<Tobj>>;

export class FilterBar<Tobj> extends React.Component<FilterBarProps<Tobj>, FilterBarState> {
    constructor(props: FilterBarProps<Tobj>) {
        super(props);

        this.state = {
            showMenu: false,
        }
    }

    availableChildren = React.Children.toArray(this.props.children);

    componentDidMount() {
        const { fql, onFilterUpdate } = this.props;

        const filterQueries = (this.availableChildren
            .filter(child => {
                return (child as FilterElement<Tobj>).props.shown
            }) as FilterElement<Tobj>[])
            .map(filter => {
                const field = filter.props.field;
                const filterQuery: FilterQuery<Tobj> = filter.props.getDefaultFilterQuery && filter.props.getDefaultFilterQuery(field) || {
                    field,
                    logic: Logics.OR,
                    filterItems: []
                };

                return filterQuery;
            });

        if (!!onFilterUpdate) {
            if (!!fql && !!fql.filterQueries) {
                onFilterUpdate({
                    ...fql, filterQueries: [
                        ...filterQueries,
                        ...fql.filterQueries,
                    ]
                });
            } else {
                onFilterUpdate({
                    logic: Logics.AND,
                    filterQueries,
                })
            }
        }
    }

    onRemoveFilter: RemoveFilterHandler<Tobj> = (field) => {
        const { fql, onFilterUpdate } = this.props;
        if (!!fql) {
            fql.filterQueries = [...fql.filterQueries.filter(fq => this.getField(fq.field) != this.getField(field))];
            onFilterUpdate(fql);
        }
    }

    onAddFilter = (filter: FilterElement<Tobj>) => {
        const { fql, onFilterUpdate } = this.props;
        const field = filter.props.field;
        const filterQuery: FilterQuery<Tobj> = filter.props.getDefaultFilterQuery && filter.props.getDefaultFilterQuery(field) || {
            field,
            logic: Logics.OR,
            filterItems: []
        };

        if (!!fql) {
            fql.filterQueries = [...fql.filterQueries, filterQuery];
            onFilterUpdate({ ...fql });
        }
    }

    getField(fields: FilterQueryField<Tobj>) {
        return Array.isArray(fields) ? fields.join(':') : fields.toString();
    }

    render() {
        const { fql, onFilterUpdate, filterItemClassName, className, labelClassName } = this.props;

        const filterItems = fql && fql.filterQueries.map(fq => {
            const activeFilter = this.availableChildren.find(availableChild => {
                if (!availableChild) return false;
                return (availableChild as FilterElement<Tobj>).props.field === fq.field
            }) as FilterElement<Tobj>;

            const filter = React.cloneElement(activeFilter, {
                filterQuery: fq,
                onFilterUpdate: (filterQuery: FilterQuery<Tobj>) => {
                    const fqIndex = fql.filterQueries.findIndex(_filterQuery => _filterQuery.field === fq.field);
                    fql.filterQueries = [
                        ...fql.filterQueries.slice(0, fqIndex),
                        filterQuery,
                        ...fql.filterQueries.slice(fqIndex + 1)
                    ];
                    onFilterUpdate({ ...fql });
                }
            });
            const field = this.getField(activeFilter.props.field);
            const { label } = activeFilter.props;

            return <FilterItem key={field} filter={filter} onRemoveFilter={this.onRemoveFilter} field={field} label={label} className={filterItemClassName} labelClassName={labelClassName} />;
        });

        const activeFields = !!fql ? fql.filterQueries.map(fq => fq.field) : [];
        const availableFilterItems = this.availableChildren.filter(availableChild =>
            !activeFields.includes((availableChild as FilterElement<Tobj>).props.field)) as FilterElement<Tobj>[];
        const dropdownItems = availableFilterItems.map(_filter => ({
            option: _filter.props.label,
            value: _filter
        }));

        const filterBarDropdownClassName = classNames('filter-bar-dropdown filter-bar-item', { 'hide': dropdownItems.length === 0 });

        return (
            <div className={classNames("filter-bar", className)}>
                {filterItems}
                <div className="d-flex align-items-end form-group">
                    <div className={filterBarDropdownClassName}>
                        <div className="filter-bar-select-container">
                            <Dropdown label="Add Filter" items={dropdownItems} onChange={this.onAddFilter} {...this.props} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
