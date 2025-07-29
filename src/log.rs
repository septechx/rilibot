use std::fmt::Debug;

pub fn hook(name: &str, state: impl Debug) {
    println!("[INFO] Hook {name} with state {state:?} called");
}

pub fn hook_handle(name: &str, state: impl Debug) {
    println!("[INFO] Hook {name} handled with state {state:?}");
}

pub fn hook_unhandle(name: &str, state: impl Debug) {
    println!("[INFO] Hook {name} unhandled with state {state:?}");
}

pub fn handler(name: &str) {
    println!("[INFO] Handler {name} called");
}

pub fn command(name: &str) {
    println!("[INFO] Command {name} called");
}

pub fn info(message: &str) {
    println!("[INFO] {message}");
}
