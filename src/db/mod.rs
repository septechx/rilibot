pub mod queries;

use anyhow::Result;
use lazy_static::lazy_static;
use tokio_postgres::{Client, NoTls};

use crate::get_env_var;

lazy_static! {
    pub static ref HOST: String = get_env_var("POSTGRES_HOST");
    pub static ref USER: String = get_env_var("POSTGRES_USER");
    pub static ref PASSWORD: String = get_env_var("POSTGRES_PASSWORD");
    pub static ref DB: String = get_env_var("POSTGRES_DB");
}

pub async fn connect() -> Result<Client> {
    let (client, connection) = tokio_postgres::connect(
        &format!(
            "host={} user={} password={} dbname={}",
            *HOST, *USER, *PASSWORD, *DB
        ),
        NoTls,
    )
    .await?;

    tokio::spawn(async move {
        if let Err(err) = connection.await {
            eprintln!("Connection error: {err}");
        }
    });

    Ok(client)
}
