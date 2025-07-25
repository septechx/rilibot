use anyhow::{anyhow, bail, Result};
use serenity::{all::Timestamp, async_trait, model::channel::Message, prelude::*};

use crate::Handler;

use super::{args_checked, assert_mod, send_error, send_usage, usage, CommandHandler};

pub struct MuteHandler;

impl MuteHandler {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl CommandHandler for MuteHandler {
    fn get_usage(&self) -> &'static str {
        "$mute @user duration"
    }

    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        assert_mod(state, ctx, msg).await?;

        let usage_s = self.get_usage();
        let args = match args_checked(ctx, msg, 2, usage_s).await {
            Ok(a) => a,
            Err(_) => return Ok(()),
        };

        let duration_str = args[1];
        let time = match parse_duration_to_seconds(duration_str) {
            Ok(t) => t,
            Err(e) => {
                send_error(ctx, msg, &format!("Invalid duration: {e}")).await?;
                return Ok(());
            }
        };

        let user_id = match msg.mentions.first() {
            Some(user) => user.id,
            None => return send_usage(ctx, msg, usage(usage_s).to_string()).await,
        };

        let guild_id = match msg.guild_id {
            Some(g) => g,
            None => {
                send_error(ctx, msg, "This command can only be used in a server.").await?;
                return Ok(());
            }
        };

        if let Ok(mut member) = guild_id.member(&ctx.http, user_id).await {
            let until = Timestamp::from_millis(Timestamp::now().timestamp_millis() + time * 1000)
                .map_err(|_| serenity::Error::Other("Failed to create timestamp"))?;

            match member
                .disable_communication_until_datetime(&ctx, until)
                .await
            {
                Ok(_) => {
                    msg.channel_id
                        .say(&ctx.http, format!("Muted <@{user_id}> for {duration_str}."))
                        .await?;
                }
                Err(err) => {
                    send_error(ctx, msg, &format!("Failed to mute user: {err:?}")).await?;
                }
            }
        }

        Ok(())
    }
}

pub fn parse_duration_to_seconds(input: &str) -> Result<i64> {
    let input = input.trim().to_lowercase();
    let split_pos = input
        .find(|c: char| !c.is_numeric() && c != '.')
        .ok_or(anyhow!("Invalid input: no unit found (e.g. 10m, 2h)"))?;
    let (number_str, unit_str) = input.split_at(split_pos);
    let number: f64 = number_str.trim().parse()?;
    let seconds = match unit_str.trim() {
        "s" | "sec" | "second" | "seconds" => number,
        "m" | "min" | "minute" | "minutes" => number * 60.0,
        "h" | "hr" | "hour" | "hours" => number * 60.0 * 60.0,
        "d" | "day" | "days" => number * 60.0 * 60.0 * 24.0,
        "w" | "week" | "weeks" => number * 60.0 * 60.0 * 24.0 * 7.0,
        "mo" | "mon" | "month" | "months" => number * 60.0 * 60.0 * 24.0 * 30.0,
        "y" | "yr" | "year" | "years" => number * 60.0 * 60.0 * 24.0 * 30.0 * 12.0,
        _ => bail!("Unknown unit: {} (try s, m, h, d, w, mo, y)", unit_str),
    };
    Ok(seconds as i64)
}
