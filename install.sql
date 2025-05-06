CREATE TABLE
    IF NOT EXISTS mobile_user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        phone VARCHAR(10) NOT NULL,
        citizen_id VARCHAR(50) NOT NULL UNIQUE,
        avatar TEXT NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS `mobile_messages` (
        `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `sender` VARCHAR(255) NOT NULL,
        `receiver` VARCHAR(255) NOT NULL,
        `messages` TEXT NOT NULL,
        `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `groups` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `group_members` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT,
        username VARCHAR(255),
        phone VARCHAR(20),
        FOREIGN KEY (group_id) REFERENCES groups (id)
    );

CREATE TABLE
    IF NOT EXISTS `group_messages` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        sender VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `instagram_users` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `username` VARCHAR(50) NOT NULL UNIQUE,
        `email` VARCHAR(100),
        `password` VARCHAR(100),
        `image` TEXT,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `instagram_posts` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50),
        image TEXT,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `instagram_likes` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        username VARCHAR(100) NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS `instagram_comments` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        comment TEXT NOT NULL,
        username VARCHAR(100) NOT NULL timeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `instagram_shares` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        username VARCHAR(100) NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS `instagram_stories` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255),
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
    );

CREATE TABLE
    IF NOT EXISTS `instagram_followers` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `follower_id` INT NOT NULL,
        `following_id` INT NOT NULL,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`follower_id`) REFERENCES instagram_users (id) ON DELETE CASCADE,
        FOREIGN KEY (`following_id`) REFERENCES instagram_users (id) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `phone_call_logs` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        caller VARCHAR(20),
        receiver VARCHAR(20),
        time DATETIME,
        status VARCHAR(20)
    );

CREATE TABLE
    IF NOT EXISTS `youtube_videos` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        citizenid VARCHAR(50),
        youtube_link TEXT,
        caption_link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `facebook_users` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `username` VARCHAR(50) NOT NULL UNIQUE,
        `email` VARCHAR(100),
        `password` VARCHAR(100),
        `image` TEXT,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS facebook_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50),
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `facebook_likes` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS `facebook_comments` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `facebook_friend_requests` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        status ENUM ('pending', 'accepted', 'declined') DEFAULT 'pending',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES facebook_users (id),
        FOREIGN KEY (receiver_id) REFERENCES facebook_users (id)
    );

CREATE TABLE
    IF NOT EXISTS `facebook_friends` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        friend_id INT NOT NULL,
        since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES facebook_users (id),
        FOREIGN KEY (friend_id) REFERENCES facebook_users (id)
    );