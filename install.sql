CREATE TABLE IF NOT EXISTS mobile_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    citizen_id VARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE `mobile_messages` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `sender` VARCHAR(255) NOT NULL,
  `receiver` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
