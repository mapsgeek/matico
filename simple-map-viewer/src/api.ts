import axios, { AxiosResponse } from 'axios';

export interface Dataset {
    name: string;
    description: string;
    id: string;
    created_at: Date;
    updated_at: Date;
    geom_col: string;
    id_col: string;
}

export interface Column {
    name: string;
    col_type: string;
    source_query: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

export interface Page {
    limit: number;
    offset: number;
}

export type Color = [number, number, number, number];

export interface SingleColorSpecification {
    color: Color;
}

export interface CategoryColorSpecification {
    column: string;
    categories: Array<string | number>;
    colors: Array<Color>;
}

export enum NumericalCategorizationMethod {
    Quantiles = 'quantiles',
    EqualInterval = 'equal_interval',
    Scaled = 'scaled',
    Custom = 'custom',
}

export interface ValueSpecification {
    column: string;
    method: NumericalCategorizationMethod;
    bins: number[];
}

export interface ValueColorSpecification {
    values: ValueSpecification;
    colors: Color[];
}

export interface ColorSpecification {
    single_color?: SingleColorSpecification;
    category_color?: CategoryColorSpecification;
}

export const DefaultFillColor: Color = [140, 170, 180, 90];
export const DefaultStrokeColor: Color = [200, 200, 200, 90];

export enum BaseMap {
    Light = 'Light',
    Dark = 'Dark',
    Satelite = 'Satelite',
    Terrain = 'Terrain',
    Streets = 'Streets',
    CartoDBPositron = 'CartoDBPositron',
    CartoDBVoyager = 'CartoDBVoyager',
    CartoDBDarkMatter = 'CartoDBDarkMatter',
    Custom = 'Custom',
}

export enum Unit {
    Pixels = 'pixels',
    Meters = 'meters',
}

export const DefaultPolyonStyle: PolygonStyle = {
    fill: { single_color: { color: DefaultFillColor } },
    stroke: { single_color: { color: DefaultStrokeColor } },
    stroke_width: 3,
    opacity: 1,
    stroke_units: Unit.Pixels,
    elevation: null,
};

export const DefaultPointStyle: PointStyle = {
    fill: { single_color: { color: DefaultFillColor } },
    size: 20,
    stroke: { single_color: { color: DefaultStrokeColor } },
    stroke_width: 3,
    opacity: 1,
    stroke_units: Unit.Pixels,
    size_units: Unit.Pixels,
};

export const DefaultLineStyle: LineStyle = {
    stroke: { single_color: { color: DefaultStrokeColor } },
    stroke_width: 3,
    opacity: 1,
};

export interface PointStyle {
    fill: ColorSpecification;
    size: number;
    stroke: ColorSpecification;
    stroke_width: number;
    opacity: number;
    size_units: Unit;
    stroke_units: Unit;
}

export interface PolygonStyle {
    fill: ColorSpecification;
    stroke: ColorSpecification;
    stroke_width: number;
    opacity: number;
    stroke_units: Unit;
    elevation: ValueSpecification | null;
}

export interface LineStyle {
    stroke: ColorSpecification;
    stroke_width: number;
    opacity: number;
}

export interface QuerySource {
    Query: string;
}

export interface DatasetSource {
    Dataset: string;
}

export interface RawQuerySource {
    RawQuery: string;
}
export interface GeoJSONSource {
    url: string;
}

export type LayerSource =
    | QuerySource
    | DatasetSource
    | RawQuerySource
    | GeoJSONSource;

export type LayerStyle = {
    Point?: PointStyle;
    Polygon?: PolygonStyle;
    Line?: LineStyle;
};

export interface Layer {
    source: LayerSource;
    style: LayerStyle;
    name: string;
    description: string;
}

export interface MapStyle {
    layers: Layer[];
    center: number[];
    zoom: number;
    base_map: BaseMap;
}

export const DefaultMapStyle: MapStyle = {
    center: [-74.006, 40.7128],
    zoom: 13,
    base_map: BaseMap.Light,
    layers: [],
};

export interface Dashboard {
    name: string;
    id: string;
    description: string;
    owner_id: string;
    public: boolean;
    map_style: MapStyle;
    created_at: Date;
    updated_at: Date;
}

export interface CreateDashboardDTO {
    name: string;
    description: string;
    public: boolean;
    map_style: MapStyle;
}

export interface ValueCount {
    name: string;
    count: number;
}

export interface UpdateDashboardDTO {
    name?: string;
    description?: string;
    public?: boolean;
    map_style?: MapStyle;
}
// export interface Token {
//     iat: number;
//     exp: number;
//     username: string;
//     id: string;
// }

export interface LoginResponse {
    user: User;
    token: string;
}

export interface SignupResponse {
    user: User;
    token: string;
}

const a = axios.create({
    baseURL:
        !process.env.NODE_ENV ||
        process.env.NODE_ENV === 'development'
            ? '/api'
            : `${window.location.origin}/api`,
    headers: { 'Content-Type': 'application/json' },
});

a.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

export function uploadFile(
    file: File,
    url: string,
    metadata?: any,
    onProgress?: (progress: number) => void,
) {
    const formData = new FormData();

    console.log('metadata is ', metadata);

    formData.append('metadata', JSON.stringify(metadata));
    formData.append('file', file);

    const progress = (e: any) => {
        if (onProgress) {
            onProgress(Math.round((100 * e.loaded) / e.total));
        }
    };

    return a.post(url, formData, {
        headers: {
            Content_Type: 'multipart/form-data',
        },
        onUploadProgress: progress,
    });
}

type CreateSyncDataset = {
    name: string;
    url: string;
    description: string;
    refreshInterval: number;
};

export function createSyncDataset(syncDetails: CreateSyncDataset) {
    return a.post('/datasets', syncDetails);
}

export function deleteDashboard(dashboard_id: string) {
    return a.delete(`/dashboards/${dashboard_id}`);
}

export function deleteDataset(dataset_id: string) {
    return a.delete(`/datasets/${dataset_id}`);
}

export async function getProfile(): Promise<AxiosResponse<User>> {
    return a.get('/users/profile');
}

export async function login(
    email: string,
    password: string,
): Promise<AxiosResponse<LoginResponse>> {
    return a.post('/auth/login', { email, password });
}

export async function signup(
    username: string,
    password: string,
    email: string,
): Promise<AxiosResponse<SignupResponse>> {
    return a.post('/auth/signup', { email, password, username });
}

export async function getDatasets(): Promise<
    AxiosResponse<Dataset[]>
> {
    return a.get('/datasets');
}

export async function getDataset(
    id: string,
): Promise<AxiosResponse<Dataset>> {
    return a.get(`datasets/${id}`);
}

export async function getPagedDatasetData(
    id: string,
    page: Page,
): Promise<AxiosResponse<any>> {
    return a.get(`datasets/${id}/data`, { params: page });
}

export async function getDashboards(): Promise<
    AxiosResponse<Dashboard[]>
> {
    return a.get('dashboards');
}

export async function getDatasetColumns(
    id: string,
): Promise<AxiosResponse<Column[]>> {
    return a.get(`datasets/${id}/columns`);
}

export async function getDashboard(
    id: string,
): Promise<AxiosResponse<Dashboard>> {
    return a.get(`dashboards/${id}`);
}

export async function createDashboard(
    newDashboard: CreateDashboardDTO,
) {
    return a.post('/dashboards', newDashboard);
}

export async function updateDashboard(
    dataset_id: string,
    update: UpdateDashboardDTO,
): Promise<AxiosResponse<Dashboard>> {
    return a.put(`/dashboards/${dataset_id}`, update);
}

export async function updateFeature(
    dataset_id: string,
    feature_id: string,
    update: any,
) {
    return a.put(`datasets/${dataset_id}/data/${feature_id}`, update);
}

export async function getColumnStats(
    source: LayerSource,
    column: Column,
) {
    if (Object.keys(source)[0] === 'Dataset') {
        const datasetSource = source as DatasetSource;
        return a.get(
            `datasets/${datasetSource.Dataset}/columns/${
                column.name
            }/stats?stat=${JSON.stringify({
                BasicStats: {
                    no_bins: 20,
                },
            })}`,
        );
    } else {
        throw Error(
            'Layer source does not implement this functionality yet',
        );
    }
}
export async function getUniqueColumnValues(
    dataset_id: string,
    column_name: string,
) {
    return a.get(
        `datasets/${dataset_id}/columns/${column_name}/stats?stat=${JSON.stringify(
            { ValueCounts: {} },
        )}`,
    );
}
export async function getColumnHistogram(
    column: Column,
    source: LayerSource,
    bins: number,
) {
    if (Object.keys(source)[0] === 'Dataset') {
        const datasetSource = source as DatasetSource;
        return a.get(
            `datasets/${datasetSource.Dataset}/columns/${
                column.name
            }/stats?stat=${JSON.stringify({
                Histogram: {
                    no_bins: 20,
                },
            })}`,
        );
    } else {
        throw Error(
            'Layer source does not implement this functionality yet',
        );
    }
}

// not sure if run is the right verb here, but
// this endpoint isn't restful anyway
export async function runQuery(
    sql: string,
    page: Page,
): Promise<AxiosResponse<Dataset>> {
    return a.get(`queries/run?q=${sql}`, { params: page });
}

export default a;
