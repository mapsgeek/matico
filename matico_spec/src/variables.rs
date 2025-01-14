use crate::Filter;
use serde::{Deserialize, Serialize};
use validator::{Validate, ValidationErrors};

#[derive(Serialize, Deserialize, Debug, Clone, Validate)]
pub struct Variable {
    var: String,
    bind: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct QuantileParams {
    bins: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct JenksParams {
    bins: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct EqualIntervalParams {
    pub bins: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CategoriesParams {
    pub no_categories: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum DatasetMetric {
    Min,
    Max,
    Quantile(QuantileParams),
    Jenks(JenksParams),
    EqualInterval(EqualIntervalParams),
    Categories(CategoriesParams),
    Mean,
    Median,
    Summary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", untagged)]
pub enum Range<T> {
    Range(Vec<T>),
    Named(String),
}


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum DomainVal {
    String(String),
    Value(f32),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mapping<D, R> {
    pub variable: String,
    pub domain: VarOr<Vec<D>>,
    pub range: VarOr<Range<R>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum MappingVarOr<T> {
    Var(Variable),
    Mapping(Mapping<DomainVal, T>),
    Value(T),
}

#[derive(Serialize, Deserialize, Debug, Clone, Validate)]
pub struct DatasetVal {
    pub dataset: String,
    pub column: Option<String>,
    pub metric: Option<DatasetMetric>,
    pub filters: Option<Vec<Filter>>,
    pub feature_id: Option<String>,
}

#[derive(Serialize, Debug, Deserialize, Clone)]
#[serde(untagged)]
pub enum VarOr<T> {
    Var(Variable),
    Value(T),
    DVal(DatasetVal),
}

impl<T> Validate for VarOr<T>
where
    T: Validate,
{
    fn validate(&self) -> ::std::result::Result<(), ValidationErrors> {
        let errors = ValidationErrors::new();
        let result = if errors.is_empty() {
            Result::Ok(())
        } else {
            Result::Err(errors)
        };

        match self {
            Self::Var(v) => ValidationErrors::merge(result, "Variable", v.validate()),
            Self::DVal(v) => ValidationErrors::merge(result, "", v.validate()),
            Self::Value(val) => ValidationErrors::merge(result, "Value", val.validate()),
        }
    }
}
