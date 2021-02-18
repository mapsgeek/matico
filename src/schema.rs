table! {
    dashboards (id) {
        id -> Uuid,
        name -> Text,
        owner_id -> Uuid,
        description -> Text,
        map_style -> Jsonb,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        public -> Bool,
    }
}

table! {
    datasets (id) {
        id -> Uuid,
        owner_id -> Uuid,
        name -> Text,
        original_filename -> Text,
        original_type -> Text,
        sync_dataset -> Bool,
        sync_url -> Nullable<Text>,
        sync_frequency_seconds -> Nullable<Int8>,
        post_import_script -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        public -> Bool,
        description -> Text,
        geom_col -> Text,
        id_col -> Text,
    }
}

table! {
    queries (id) {
        id -> Uuid,
        name -> Text,
        description -> Text,
        sql -> Text,
        parameters -> Array<Jsonb>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    users (id) {
        id -> Uuid,
        username -> Text,
        email -> Text,
        password -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

allow_tables_to_appear_in_same_query!(
    dashboards,
    datasets,
    queries,
    users,
);
