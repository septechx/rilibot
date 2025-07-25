pub mod queries;

use anyhow::Result;
use tokio_postgres::{Client, NoTls};

use crate::get_env_var;

pub async fn connect() -> Result<Client> {
    let host = get_env_var("POSTGRES_HOST");
    let user = get_env_var("POSTGRES_USER");
    let password = get_env_var("POSTGRES_PASSWORD");
    let db = get_env_var("POSTGRES_DB");

    let (client, connection) = tokio_postgres::connect(
        &format!("host={host}, user={user}, password={password}, dbname={db}"),
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
