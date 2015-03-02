CREATE TABLE `alerts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL DEFAULT '',
  `business_id` varchar(30) DEFAULT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `type` enum('all','score','critical') NOT NULL DEFAULT 'all',
  `value` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `lastTriggeredAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;