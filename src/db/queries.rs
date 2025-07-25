use anyhow::Result;
use tokio_postgres::Client;

pub async fn mod_role(client: &Client, guild_id: &str) -> Result<Option<String>> {
    let rows = client
        .query("SELECT * FROM mod_roles WHERE guild_id = $1", &[&guild_id])
        .await?;

    Ok(if rows.is_empty() {
        None
    } else {
        Some(rows[0].get("role_id"))
    })
}
