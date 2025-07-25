use serenity::{async_trait, model::channel::Message, prelude::*};

use super::{send_error, send_usage, usage, CommandHandler};

use crate::Handler;

pub struct UnmuteHandler;

impl UnmuteHandler {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl CommandHandler for UnmuteHandler {
    fn get_usage(&self) -> &'static str {
        "$unmute @user"
    }

    async fn handle(&self, _state: &Handler, ctx: &Context, msg: &Message) -> serenity::Result<()> {
        let usage_s = self.get_usage();

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
            match member.enable_communication(&ctx.http).await {
                Ok(_) => {
                    msg.channel_id
                        .say(&ctx.http, format!("Unmuted <@{user_id}>."))
                        .await?;
                }
                Err(err) => {
                    send_error(ctx, msg, &format!("Failed to unmute user: {err:?}")).await?;
                }
            }
        }

        Ok(())
    }
}
