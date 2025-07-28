use anyhow::Result;
use serenity::{async_trait, model::channel::Message, prelude::*};

use crate::Handler;

use super::{assert_mod, send_error, send_usage, usage, CommandHandler};

pub struct RoleCommand;

impl RoleCommand {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl CommandHandler for RoleCommand {
    fn get_usage(&self) -> &'static str {
        "$role ...@user ...@role"
    }

    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        assert_mod(state, ctx, msg).await?;

        let usage_s = self.get_usage();

        let user_ids = msg.mentions.iter().map(|user| user.id).collect::<Vec<_>>();
        if user_ids.is_empty() || msg.mention_roles.is_empty() {
            return send_usage(ctx, msg, usage(usage_s).to_string()).await;
        }

        let guild_id = match msg.guild_id {
            Some(g) => g,
            None => {
                send_error(ctx, msg, "This command can only be used in a server.").await?;
                return Ok(());
            }
        };

        for user_id in user_ids {
            if let Ok(member) = guild_id.member(&ctx.http, user_id).await {
                for role_id in &msg.mention_roles {
                    match member.add_role(&ctx.http, role_id).await {
                        Ok(_) => {
                            msg.channel_id
                                .say(&ctx.http, format!("Gave <@&{role_id}> to <@{user_id}>."))
                                .await?;
                        }
                        Err(_) => {
                            send_error(
                                ctx,
                                msg,
                                &format!("Failed to give <@&{role_id}> to <@{user_id}>."),
                            )
                            .await?;
                        }
                    }
                }
            }
        }

        Ok(())
    }
}
