import {
  Dataset,
  Column,
  GeomType,
  Filter,
  RangeFilter,
  DatasetState,
  HistogramBin,
} from "./Dataset";

import { predicate, DataFrame } from "@apache-arrow/es5-cjs";
import _ from "lodash";
import * as d3 from "d3-array";

export class LocalDataset implements Dataset {
  private _isReady: boolean;
  //TODO find a way to make this a more general expression
  private _filterCache: any;

  constructor(
    public name: string,
    public idCol: string,
    private _columns: Array<Column>,
    public _data: DataFrame,
    public _geometryType: GeomType,
    onStateChange?: (state: DatasetState) => void
  ) {
    this._isReady = true;
    this._filterCache = [];
  }

  isReady() {
    return this._isReady;
  }

  local() {
    return true;
  }
  raster() {
    return false;
  }

  tiled() {
    return false;
  }

  geometryType() {
    return Promise.resolve(this._geometryType);
  }

  columns() {
    return Promise.resolve(this._columns);
  }

  getFeature(feature_id: string) {
    const selectPredicate = predicate.col(this.idCol).eq(feature_id);
    const results = this._getResultsFromPredicate(selectPredicate);
    return Promise.resolve(results);
  }

  getArrow() {
    return this._data.serialize();
  }

  getDataWithGeo(filters?: Array<Filter>) {
    return Promise.resolve(this.getData(filters));
  }

  _applyAggregateFunction<AggType>(
    column: string,
    aggFunc: (agg: AggType, val: number) => AggType,
    initalVal: AggType,
    filters?: Array<Filter>
  ): AggType {
    let base = null;
    if (filters && filters.length) {
      const predicate = this._constructPredicate(filters);
      base = this._data.filter(predicate);
    } else {
      base = this._data;
    }
    let columnVals;
    let agg: AggType = initalVal;

    base.scan(
      (index) => {
        const aggResult = aggFunc(agg, columnVals(index));
        agg = aggResult;
      },
      (batch) => {
        columnVals = predicate.col(column).bind(batch);
      }
    );
    return agg;
  }

  getColumnMax(column: string, filters?: Array<Filter>) {
    let columnMax = this._applyAggregateFunction(
      column,
      (agg, val) => (val > agg ? val : agg),
      Number.MIN_VALUE,
      filters
    );
    return Promise.resolve(columnMax);
  }

  getColumnMin(column: string, filters?: Array<Filter>) {
    let columnMin = this._applyAggregateFunction(
      column,
      (agg, val) => (val < agg ? val : agg),
      Number.MAX_VALUE,
      filters
    );
    return Promise.resolve(columnMin);
  }

  getColumnSum(column: string, filters?: Array<Filter>) {
    let columnSum = this._applyAggregateFunction(
      column,
      (agg, val) => (agg += val),
      0,
      filters
    );
    return Promise.resolve(columnSum);
  }

  getCategoryCounts(column: string, filters?: Array<Filter>) {
    let categoryCounts = this._applyAggregateFunction(
      column,
      (agg, val) => {
        agg[val] = agg[val] ? agg[val] + 1 : 1;
        return agg;
      },
      {},
      filters
    );
    return Promise.resolve(categoryCounts);
  }

  getCategories(column: string, noCategories: number, filters?: Array<Filter>) {
    return this.getCategoryCounts(column, filters).then((categoryCounts) => {
      return Object.entries(categoryCounts)
        .sort((a, b) => (a[1] > b[1] ? 1 : -1))
        .slice(0, noCategories)
        .map((cat: any) => cat[0]);
    });
  }

  getEqualIntervalBins(column: string, bins: number, filters?: Array<Filter>) {
    console.log(`getting equal intervals for ${column}`)
    const range = this._applyAggregateFunction(
      column,
      (agg, val) => [val < agg[0] ? val : agg[0], val > agg[1] ? val : agg[1]],
      [Number.MAX_VALUE, Number.MIN_VALUE],
      filters
    );

    let intervalBins = _.range(bins).map(
      (i: number) => range[0] + ((range[1] - range[0]) * i) / bins
    );
    return Promise.resolve(intervalBins);
  }

  async getQuantileBins(column: string, bins: number, filters?: Array<Filter>) {
    const data = await this.getData(filters, [column]);
    const vals = data.map((c: any) => c[column]).sort();
    const binSize = 1.0 / bins;
    const quantileBins = _.range(bins).map((i: number) =>
      d3.quantile(vals, i * binSize)
    );
    return Promise.resolve(quantileBins);
  }

  getJenksBins(column: string, bins: number, filters?: Array<Filter>) {
    throw Error("function not implemented");
    return Promise.resolve([1, 23, 4, 5, 6]);
  }

  _constructPredicate(filters?: Array<Filter>) {
    let combinedPredicate = null;
    let columnNames = this._columns.map((c) => c.name);
    filters.forEach((filterOuter) => {
      const [type, filter] = Object.entries(filterOuter)[0];
      if (!columnNames.includes(filter.variable)) {
        return;
      }
      switch (type) {
        case "Range":
          const rangeFilter = filter as RangeFilter;
          const { min, max, variable } = rangeFilter;
          if (min) {
            const mf = predicate.col(variable).gt(min);
            combinedPredicate = combinedPredicate
              ? combinedPredicate.and(mf)
              : mf;
          }
          if (max) {
            const mf = predicate.col(variable).lt(max);
            combinedPredicate = combinedPredicate
              ? combinedPredicate.and(mf)
              : mf;
          }
        case "Category":
        default:
          return;
      }
    });
    return combinedPredicate;
  }

  async getColumnHistogram(
    column: string,
    noBins: number,
    filters?: Array<Filter>
  ) {
    const maxVal = await this.getColumnMax(column, filters);
    const minVal = await this.getColumnMin(column, filters);
    const binWidth = (maxVal - minVal) / noBins;
    const initalBins = [...Array(noBins - 1)].map((_) => 0);

    const counts = this._applyAggregateFunction(
      column,
      (agg, value) => {
        const bin = Math.floor((value - minVal) / binWidth);
        agg[bin] += 1;
        return agg;
      },
      [...Array(noBins - 1)].map((_) => 0),
      filters
    );
    return counts.map((count: number, index: number) => ({
      count,
      binStart: index * binWidth,
      binEnd: (index + 1) * binWidth,
    }));
  }

  async _getResultsFromPredicate(
    filterPredicate?: any,
    columns?: Array<string>
  ) {
    const filterResults = filterPredicate
      ? this._data.filter(filterPredicate)
      : this._data;

    try {
      const vars = {};
      let results = [];

      let selectColumns = columns
        ? columns
        : (await this.columns()).map((c) => c.name);

      selectColumns = [...selectColumns, "geom"];

      filterResults.scan(
        (index) => {
          results.push(
            selectColumns.reduce((agg, col) => {
              return {
                ...agg,
                //@ts-ignore
                [col]: vars[col](index),
              };
            }, {})
          );
        },
        (batch) => {
          selectColumns.forEach((col) => {
            vars[col] = predicate.col(col).bind(batch);
          });
        }
      );
      return results;
    } catch (e) {
      console.log(
        `something went wrong applying filters cowardly returning empty array ${e}`
      );
      return [];
    }
  }

  getData(filters?: Array<Filter>, columns?: Array<string>) {
    const cacheKey = JSON.stringify([filters, columns]);
    if (this._filterCache[cacheKey]) {
      return this._filterCache[cacheKey];
    }
    if (filters && filters.length) {
      const predicate = this._constructPredicate(filters);
      const results = this._getResultsFromPredicate(predicate);

      this._filterCache[JSON.stringify(filters)] = results;
      return results;
    }
    return Promise.resolve(this._getResultsFromPredicate());
  }
}
