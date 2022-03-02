import React from 'react';
import DatePicker from 'react-datepicker';
import { get, find } from 'lodash';

// Local imports
import { Dropdown } from '../../dropdown/dropdown';
import { FilterQuery, FilterQueryField, Logics, Operations } from 'filter-query-language-core';
import { FilterProps, IDefaultFilterProps, IGetDefaultFilterQuery } from '../filter-bar';

const dateOperations = [
    {
        value: 1,
        option: 'Before'
    },
    {
        value: 2,
        option: 'After'
    },
    {
        value: 3,
        option: 'Between',
    }
]

type DateFilterProps = {
    showOperator?: boolean,
    className?: string,
    buttonClassName?: string,
}

export const getDefaultFilterQuery = <Tobj extends {}>(field: FilterQueryField<Tobj>): FilterQuery<Tobj> => ({
    field,
    logic: Logics.AND,
    filterItems: [{
        operation: Operations.LTE,
        value: new Date(),
    }]
});

export class DateFilter<Tobj> extends React.Component<FilterProps<Tobj, DateFilterProps>> {
    public static defaultProps: IGetDefaultFilterQuery<IDefaultFilterProps> = {
        getDefaultFilterQuery,
    }

    /**
     * Get the start date from the filter query.
     * This is always the value in the first filter item of the query.
     */
    getStartDate = <Tobj extends {}>(filterQuery: FilterQuery<Tobj> | undefined) => {
        return get(filterQuery, 'filterItems[0].value', new Date());
    }

    /**
     * Get the end date from the filter query.
     * This is always the value in the second element of filter items in a query.
     * The second element only exists for between operations.
     */
    getEndDate = <Tobj extends {}>(filterQuery: FilterQuery<Tobj> | undefined) => {
        return get(filterQuery, 'filterItems[1].value', new Date());
    }

    /**
     * Get the operation value based on the number of filter items and the 
     * operation of the first item, if there is only one.
     */
    getOperationValue = <Tobj extends {}>(filterQuery: FilterQuery<Tobj> | undefined) => {
        if (filterQuery) {
            if (filterQuery.filterItems.length > 1) {
                return 3;
            }

            return get(filterQuery, 'filterItems[0].operation', Operations.LTE) == Operations.LTE ? 1 : 2;
        }
        return 1;
    }

    /**
     * Event handler for when the start date has changed.
     */
    onChangeStartDatePicker = (startDate: Date) => {
        const { onFilterUpdate, field, filterQuery } = this.props
        onFilterUpdate && onFilterUpdate({
            field,
            logic: Logics.AND,
            filterItems: this.getFilterItems(this.getOperationValue(filterQuery), startDate, this.getEndDate(filterQuery)),
        });
    }

    /**
     * Event handler for when the end date has changed.
     */
    onChangeEndDatePicker = (endDate: Date) => {
        const { onFilterUpdate, field, filterQuery } = this.props
        onFilterUpdate && onFilterUpdate({
            field,
            logic: Logics.AND,
            filterItems: this.getFilterItems(this.getOperationValue(filterQuery), this.getStartDate(filterQuery), endDate),
        });
    }

    /**
     * Event handler for whe the operation is changed.
     */
    onChangeDropdown = (operationValue: number) => {
        const { onFilterUpdate, field, filterQuery } = this.props;
        const startDate = this.getStartDate(filterQuery);
        const endDate = this.getEndDate(filterQuery);

        onFilterUpdate && onFilterUpdate({
            field,
            logic: Logics.AND,
            filterItems: this.getFilterItems(operationValue, startDate, endDate)
        });
    }

    getFilterItems = (operationValue: number, startDate: Date, endDate: Date) => {
        switch (operationValue) {
            default:
            case 1:
                return [{
                    operation: Operations.LTE,
                    value: startDate,
                }];
            case 2:
                return [{
                    operation: Operations.GTE,
                    value: startDate,
                }];
            case 3:
                return [{
                    operation: Operations.GTE,
                    value: startDate,
                }, {
                    operation: Operations.LTE,
                    value: endDate,
                }];
        }
    }

    render() {
        const { showOperator, filterQuery, buttonClassName } = this.props;
        const operationValue = this.getOperationValue(filterQuery);
        const operations = find(dateOperations, i => i.value === operationValue);

        return (
            <div className="filter-bar-input-group input-group flex-nowrap">
                {
                    showOperator &&
                    <div className="input-group-prepend">
                        <Dropdown items={dateOperations} label={operations ? operations.option : ''} buttonClassName={buttonClassName} onChange={this.onChangeDropdown} />
                    </div>
                }
                <div className="d-flex align-items-center w-100">
                    <DatePicker className="form-control" selected={this.getStartDate(filterQuery)} onChange={this.onChangeStartDatePicker} />
                    {
                        operationValue == 3 &&
                        <>
                            <span>-</span>
                            <DatePicker className="form-control" selected={this.getEndDate(filterQuery)} onChange={this.onChangeEndDatePicker} />
                        </>
                    }
                </div>
            </div>
        );
    }
}