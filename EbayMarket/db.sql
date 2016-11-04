CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(65) NOT NULL,
  `password` VARCHAR(65) NOT NULL,
  `firstName` VARCHAR(128) NOT NULL,
  `lastName` VARCHAR(128) NOT NULL,
  `lastLogin` DATETIME NOT NULL,
  PRIMARY KEY (`id`)  COMMENT '',
  UNIQUE INDEX `email` (`email` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

CREATE TABLE IF NOT EXISTS `profile` (
  `userId` INT(11) NOT NULL,
  `street` VARCHAR(128) default null,
  `city` VARCHAR(128) default null,
  `state` VARCHAR(128) default null,
  `zipcode` VARCHAR(128) default null,
  `country` VARCHAR(128) default null)
ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `type` INT(2) NOT NULL,
  `name` VARCHAR(65) NOT NULL,
  `description` VARCHAR(256) NOT NULL,
  `soldNum` INT(11) NOT NULL,
  `num` INT(11) NOT NULL,
  `startPrice` FLOAT(11,2),
  `buyNowPrice` FLOAT(11,2) NOT NULL,
  `currBid` FLOAT(11,2) NOT NULL,
  `datePost` DATETIME NOT NULL,
  `dateExpire` DATETIME NOT NULL,
  `cond` VARCHAR(65) NOT NULL,
  `bids` INT(11) NOT NULL,
  `userId` INT(11) NOT NULL,
  PRIMARY KEY (`id`)  COMMENT '')
ENGINE = InnoDB
AUTO_INCREMENT = 1;


CREATE TABLE IF NOT EXISTS `cart` (
  `buyerId` INT(11) NOT NULL,
  `itemId` INT(11) NOT NULL,
  `quantity` INT(11) NOT NULL)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `orders` (
  `sellerId` INT(11) NOT NULL,
  `buyerId` INT(11) NOT NULL,
  `itemId` INT(11) NOT NULL,
  `quantity` INT(11) NOT NULL,
  `orderDate` DATETIME NOT NULL)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `bids` (
  `sellerId` INT(11) NOT NULL,
  `buyerId` INT(11) NOT NULL,
  `itemId` INT(11) NOT NULL,
  `bidAmount` FLOAT(11,2) NOT NULL,
  `bidDate` DATETIME NOT NULL)
ENGINE = InnoDB;




