mod help_command;
mod mute_command;
mod role_command;
mod say_command;
mod unmute_command;
mod van_command;

use anyhow::{anyhow, bail, Result};
use serenity::{async_trait, model::channel::Message, prelude::*};

use serenity::model::id::RoleId;
use std::collections::HashMap;

pub use help_command::HelpCommand;
pub use mute_command::MuteCommand;
pub use role_command::RoleCommand;
pub use say_command::SayCommand;
pub use unmute_command::UnmuteCommand;
pub use van_command::VanCommand;

use crate::db::queries;
use crate::Handler;

#[async_trait]
pub trait CommandHandler: Send + Sync {
    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> Result<()>;
    fn get_usage(&self) -> &'static str;
}

pub struct CommandHandlerRegistry {
    handlers: HashMap<&'static str, Box<dyn CommandHandler>>,
}

impl CommandHandlerRegistry {
    pub fn new() -> Self {
        Self {
            handlers: HashMap::new(),
        }
    }

    pub fn register<H: CommandHandler + 'static>(&mut self, name: &'static str, handler: H) {
        self.handlers.insert(name, Box::new(handler));
    }

    pub async fn process_command(
        &self,
        state: &Handler,
        ctx: &Context,
        msg: &Message,
        name: &String,
    ) -> Result<()> {
        match self.handlers.get(name.as_str()) {
            Some(ch) => {
                if let Err(err) = ch.handle(state, ctx, msg).await {
                    eprintln!("[ERROR] Error in command handler {name}: {err:?}");
                }
            }
            None => {
                eprintln!("[WARN] Command not found: {name}");
            }
        };

        Ok(())
    }
}

pub fn args(msg: &Message) -> Vec<&str> {
    let parts: Vec<_> = msg.content.strip_prefix("$").unwrap().split(' ').collect();
    parts[1..].to_vec()
}

pub async fn args_checked<'a>(
    ctx: &Context,
    msg: &'a Message,
    expected_len: usize,
    usage_s: &'static str,
) -> Result<Vec<&'a str>> {
    let args = args(msg);

    if args.len() != expected_len {
        msg.channel_id.say(&ctx.http, usage(usage_s)).await?;

        bail!(
            "Expected {} arguments, received {}",
            expected_len,
            args.len()
        );
    }

    Ok(args)
}

pub fn usage(s: &'static str) -> String {
    format!("Usage: {s}")
}

pub async fn send_usage(ctx: &Context, msg: &Message, usage_msg: String) -> Result<()> {
    msg.channel_id.say(&ctx.http, usage_msg).await?;
    Ok(())
}

pub async fn send_error(ctx: &Context, msg: &Message, err: &str) -> Result<()> {
    msg.channel_id.say(&ctx.http, err).await?;
    Ok(())
}

pub async fn user_has_role(ctx: &Context, msg: &Message, role_id_str: &str) -> Result<bool> {
    let guild_id = match msg.guild_id {
        Some(g) => g,
        None => return Ok(false),
    };
    let member = match guild_id.member(&ctx.http, msg.author.id).await {
        Ok(m) => m,
        Err(_) => return Ok(false),
    };
    let role_id = match role_id_str.parse::<u64>() {
        Ok(id) => RoleId::from(id),
        Err(_) => return Ok(false),
    };
    Ok(member.roles.contains(&role_id))
}

pub async fn assert_mod(state: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
    let guild_id = msg.guild_id.ok_or(anyhow!("Command not ran in a server"))?;
    let role_id = queries::mod_role(&state.db_client, &guild_id.get().to_string())
        .await?
        .ok_or(anyhow!("Role id not found in database"))?;

    if user_has_role(ctx, msg, &role_id).await? {
        Ok(())
    } else {
        msg.channel_id
            .say(&ctx.http, "You do not have permission to run that command")
            .await?;
        bail!("User does not have the mod role")
    }
}
