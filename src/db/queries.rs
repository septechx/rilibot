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

pub async fn get_van_data(client: &Client, guild_id: &str) -> Result<(i32, i32)> {
    let rows = client
        .query(
            "SELECT chance, times_ran FROM van_command_data WHERE guild_id = $1",
            &[&guild_id],
        )
        .await?;

    Ok(if rows.is_empty() {
        client
            .execute(
                "INSERT INTO van_command_data (guild_id, chance, times_ran) VALUES ($1, $2, $3)",
                &[&guild_id, &1, &0],
            )
            .await?;
        (1, 0)
    } else {
        (rows[0].get("chance"), rows[0].get("times_ran"))
    })
}

pub async fn increment_van_runs(client: &Client, guild_id: &str) -> Result<()> {
    client
        .execute(
            "UPDATE van_command_data SET times_ran = times_ran + 1 WHERE guild_id = $1",
            &[&guild_id],
        )
        .await?;
    Ok(())
}
