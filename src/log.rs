use std::fmt::Debug;

pub fn hook(name: &str, state: impl Debug) {
    println!("[INFO] Hook {name} with state {state:?} called");
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
