use anyhow::Result;
use rand::Rng;
use serenity::{async_trait, model::channel::Message, prelude::*};

use crate::{Handler, db};

use super::{CommandHandler, assert_mod, send_error, send_usage, usage};

pub struct VanCommand;

impl VanCommand {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl CommandHandler for VanCommand {
    fn get_usage(&self) -> &'static str {
        "$van ...@user"
    }

    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        assert_mod(state, ctx, msg).await?;

        let usage_s = self.get_usage();

        let user_ids = msg.mentions.iter().map(|user| user.id).collect::<Vec<_>>();
        if user_ids.is_empty() {
            return send_usage(ctx, msg, usage(usage_s).to_string()).await;
        }

        let guild_id = match msg.guild_id {
            Some(g) => g,
            None => {
                send_error(ctx, msg, "This command can only be used in a server.").await?;
                return Ok(());
            }
        };

        let guild_id_str = guild_id.get().to_string();
        let (chance, _) = crate::db::queries::get_van_data(&state.db_client, &guild_id_str).await?;
        db::queries::increment_van_runs(&state.db_client, &guild_id_str).await?;

        let number = rand::rng().random_range(1..=100);

        if number > chance {
            for user_id in user_ids {
                msg.channel_id
                    .say(&ctx.http, format!("Vanned <@{user_id}>."))
                    .await?;
            }
            return Ok(());
        }

        for user_id in user_ids {
            if let Ok(member) = guild_id.member(&ctx.http, user_id).await {
                match member.kick(&ctx.http).await {
                    Ok(_) => {
                        msg.channel_id
                            .say(&ctx.http, format!("Banned <@{user_id}>."))
                            .await?;
                    }
                    Err(_) => {
                        send_error(ctx, msg, &format!("Failed to ban <@{user_id}>.")).await?;
                    }
                }
            }
        }

        Ok(())
    }
}
