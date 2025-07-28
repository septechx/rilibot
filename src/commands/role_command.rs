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
        "$role @user @role"
    }

    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        assert_mod(state, ctx, msg).await?;

        let usage_s = self.get_usage();

        let user_id = match msg.mentions.first() {
            Some(user) => user.id,
            None => return send_usage(ctx, msg, usage(usage_s).to_string()).await,
        };

        let role_id = match msg.mention_roles.first() {
            Some(role) => role,
            None => return send_usage(ctx, msg, usage(usage_s).to_string()).await,
        };

        let guild_id = match msg.guild_id {
            Some(g) => g,
            None => {
                send_error(ctx, msg, "This command can only be used in a server.").await?;
                return Ok(());
            }
        };

        if let Ok(member) = guild_id.member(&ctx.http, user_id).await {
            match member.add_role(&ctx.http, role_id).await {
                Ok(_) => {
                    msg.channel_id
                        .say(&ctx.http, format!("Gave <@{role_id}> to <@{user_id}>."))
                        .await?;
                }
                Err(err) => {
                    send_error(ctx, msg, &format!("Failed to give role: {err:?}")).await?;
                }
            }
        }

        Ok(())
    }
}
