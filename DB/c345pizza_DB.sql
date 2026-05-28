-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Počítač: localhost:3306
-- Vytvořeno: Čtv 28. kvě 2026, 10:21
-- Verze serveru: 10.3.39-MariaDB-0ubuntu0.20.04.2
-- Verze PHP: 7.4.3-4ubuntu2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databáze: `c345pizza_DB`
--

-- --------------------------------------------------------

--
-- Struktura tabulky `bases`
--

CREATE TABLE `bases` (
  `id_bases` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `bases`
--

INSERT INTO `bases` (`id_bases`, `code`, `name`, `price`) VALUES
(1, 'tomato', 'Rajčatová omáčka', 0),
(2, 'cream', 'Smetanový základ', 0),
(3, 'BBQ', 'BBQ omáčka', 5),
(4, 'spenat', 'Špenátový', 15);

-- --------------------------------------------------------

--
-- Struktura tabulky `coupons`
--

CREATE TABLE `coupons` (
  `id_coupons` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `value` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Vypisuji data pro tabulku `coupons`
--

INSERT INTO `coupons` (`id_coupons`, `code`, `type`, `value`, `is_active`, `created_at`) VALUES
(1, 'pizza', 'percentage', '90.00', 1, '2026-05-22 08:26:04'),
(2, 'pizza100', 'fixed', '100.00', 1, '2026-05-22 08:26:04');

-- --------------------------------------------------------

--
-- Struktura tabulky `doughs`
--

CREATE TABLE `doughs` (
  `id_doughs` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `doughs`
--

INSERT INTO `doughs` (`id_doughs`, `code`, `name`, `price`) VALUES
(1, 'classic', 'Klasické těsto', 0),
(2, 'wholewheat', 'Celozrnné těsto', 10),
(4, 'kvas', 'Kváskové', 5);

-- --------------------------------------------------------

--
-- Struktura tabulky `edges`
--

CREATE TABLE `edges` (
  `id_edges` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `displayName` varchar(100) NOT NULL,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `edges`
--

INSERT INTO `edges` (`id_edges`, `code`, `name`, `displayName`, `price`) VALUES
(1, 'classic', 'Klasický okraj', 'Klasický okraj', 0),
(2, 'cheese', 'Sýrový okraj', 'Sýrový okraj (+40,-)', 30),
(3, 'sausage', 'Párkový okraj', 'Párkový okraj (+50,-)', 50);

-- --------------------------------------------------------

--
-- Struktura tabulky `ingredients`
--

CREATE TABLE `ingredients` (
  `id_ingredients` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` int(11) NOT NULL,
  `category` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `ingredients`
--

INSERT INTO `ingredients` (`id_ingredients`, `code`, `name`, `price`, `category`) VALUES
(1, 'mozzarella', 'mozzarella', 35, 'SÝRY'),
(2, 'hermelin', 'hermelín', 35, 'SÝRY'),
(3, 'niva', 'niva', 35, 'SÝRY'),
(4, 'parmesan', 'parmesan', 55, 'SÝRY'),
(6, 'salam', 'salám', 35, 'MASO'),
(7, 'slanina', 'anglická slanina', 35, 'MASO'),
(8, 'klobasa', 'pikantní klobása', 55, 'MASO'),
(9, 'cibule', 'červená cibule', 30, 'ZELENINA, OVOCE'),
(10, 'kukurice', 'kukuřice', 30, 'ZELENINA, OVOCE'),
(11, 'zampiony', 'čerstvé žampiony', 30, 'ZELENINA, OVOCE'),
(12, 'jalapenos', 'jalapeños', 30, 'ZELENINA, OVOCE'),
(13, 'tatarka', 'tatarská omáčka', 25, 'DIPY'),
(14, 'kecup', 'kečup', 25, 'DIPY'),
(15, 'chipotle', 'chipotle BBQ dip', 25, 'DIPY'),
(16, 'syrovy-dip', 'sýrový dip', 25, 'DIPY'),
(18, 'dusena-sukna', 'dušená šukna', 35, 'MASO');

-- --------------------------------------------------------

--
-- Struktura tabulky `orders`
--

CREATE TABLE `orders` (
  `id_orders` int(11) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('přijato','v přípravě','hotovo','doručeno','zrušeno') DEFAULT 'přijato',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Vypisuji data pro tabulku `orders`
--

INSERT INTO `orders` (`id_orders`, `customer_name`, `phone`, `address`, `total_price`, `status`, `created_at`) VALUES
(28, 'Jan Novák', '456893322', 'Zakopanice 123, Pardubice', '598.00', 'doručeno', '2026-05-26 07:45:03'),
(30, 'Pepa Zapotocký', '986513546', 'Valná 23, Úhřetice', '139.00', 'doručeno', '2026-05-26 08:10:54'),
(33, 'Alfréd Oldřich', '5646654654654', 'Úplná 31, Brno', '498.00', 'v přípravě', '2026-05-27 11:37:56');

-- --------------------------------------------------------

--
-- Struktura tabulky `order_items`
--

CREATE TABLE `order_items` (
  `id_order_items` int(11) NOT NULL,
  `id_orders` int(11) NOT NULL,
  `id_pizzas` int(11) NOT NULL,
  `id_bases` int(11) DEFAULT NULL,
  `id_doughs` int(11) NOT NULL,
  `id_edges` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price_per_unit` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Vypisuji data pro tabulku `order_items`
--

INSERT INTO `order_items` (`id_order_items`, `id_orders`, `id_pizzas`, `id_bases`, `id_doughs`, `id_edges`, `quantity`, `price_per_unit`) VALUES
(37, 28, 7, 3, 2, 2, 1, '449.00'),
(38, 28, 2, 2, 1, 1, 1, '249.00'),
(40, 30, 3, 1, 1, 1, 1, '239.00'),
(43, 33, 6, 2, 1, 1, 1, '259.00'),
(44, 33, 4, 1, 1, 1, 1, '239.00');

-- --------------------------------------------------------

--
-- Struktura tabulky `order_item_ingredients`
--

CREATE TABLE `order_item_ingredients` (
  `id_order_items` int(11) NOT NULL,
  `id_ingredients` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Vypisuji data pro tabulku `order_item_ingredients`
--

INSERT INTO `order_item_ingredients` (`id_order_items`, `id_ingredients`) VALUES
(37, 3),
(37, 4),
(37, 7),
(37, 9);

-- --------------------------------------------------------

--
-- Struktura tabulky `pizzas`
--

CREATE TABLE `pizzas` (
  `id_pizzas` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `price` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `default_base_code` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `pizzas`
--

INSERT INTO `pizzas` (`id_pizzas`, `code`, `name`, `description`, `price`, `image`, `default_base_code`) VALUES
(1, 'sunkova', 'Šunková', 'San Marzano rajčata, Mozzarella di Bufala, Prosciutto Cotto', 229, '/images/sunka.png', 'tomato'),
(2, 'syrova', 'Sýrová', 'Smetanový základ, Gorgonzola DOP, Parmigiano Reggiano, Pecorino', 249, '/images/syr.png', 'cream'),
(3, 'salami', 'Salami', 'San Marzano rajčata, Mozzarella, Spianata Calabrese, olivy', 239, '/images/salam.png', 'tomato'),
(4, 'hawai', 'Hawai', 'San Marzano rajčata, Mozzarella, Prosciutto, čerstvý ananas', 239, '/images/hawai.png', 'tomato'),
(5, 'margherita', 'Margherita', 'San Marzano rajčata, čerstvá Mozzarella, bazalka, olivový olej', 199, '/images/margerita.png', 'tomato'),
(6, 'capricciosa', 'Capricciosa', 'San Marzano rajčata, Mozzarella, šunka, žampiony, artyčoky', 259, '/images/capri.png', 'tomato'),
(7, 'diavola', 'Diavola', 'San Marzano, Mozzarella, Nduja z Kalábrie, čerstvé jalapeños', 249, '/images/diavola.png', 'tomato'),
(8, 'crudo', 'Crudo', 'San Marzano, Mozzarella, Prosciutto di Parma, rukola, parmazán', 269, '/images/sunka2.png', 'tomato');

-- --------------------------------------------------------

--
-- Struktura tabulky `pizzas_tags`
--

CREATE TABLE `pizzas_tags` (
  `id_pizzas` int(11) NOT NULL,
  `id_tags` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `pizzas_tags`
--

INSERT INTO `pizzas_tags` (`id_pizzas`, `id_tags`) VALUES
(1, 1),
(2, 2),
(3, 1),
(3, 3),
(4, 1),
(5, 2),
(5, 4),
(6, 1),
(6, 4),
(7, 1),
(7, 3),
(8, 1),
(8, 4);

-- --------------------------------------------------------

--
-- Struktura tabulky `tags`
--

CREATE TABLE `tags` (
  `id_tags` int(11) NOT NULL,
  `code` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `tags`
--

INSERT INTO `tags` (`id_tags`, `code`) VALUES
(1, 'meat'),
(2, 'vegetarian'),
(3, 'spicy'),
(4, 'favorite');

-- --------------------------------------------------------

--
-- Struktura tabulky `users`
--

CREATE TABLE `users` (
  `id_users` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Vypisuji data pro tabulku `users`
--

INSERT INTO `users` (`id_users`, `username`, `password`, `role`) VALUES
(1, 'admin', '60ed8731018087cdf334e84997d9186cccf13b7289ac89e50f369327b5d95e42', 'admin');

--
-- Klíče pro exportované tabulky
--

--
-- Klíče pro tabulku `bases`
--
ALTER TABLE `bases`
  ADD PRIMARY KEY (`id_bases`);

--
-- Klíče pro tabulku `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id_coupons`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Klíče pro tabulku `doughs`
--
ALTER TABLE `doughs`
  ADD PRIMARY KEY (`id_doughs`);

--
-- Klíče pro tabulku `edges`
--
ALTER TABLE `edges`
  ADD PRIMARY KEY (`id_edges`);

--
-- Klíče pro tabulku `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`id_ingredients`);

--
-- Klíče pro tabulku `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id_orders`);

--
-- Klíče pro tabulku `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id_order_items`),
  ADD KEY `fk_order_items_orders` (`id_orders`),
  ADD KEY `fk_order_items_pizzas` (`id_pizzas`),
  ADD KEY `fk_order_items_doughs` (`id_doughs`),
  ADD KEY `fk_order_items_edges` (`id_edges`);

--
-- Klíče pro tabulku `order_item_ingredients`
--
ALTER TABLE `order_item_ingredients`
  ADD PRIMARY KEY (`id_order_items`,`id_ingredients`),
  ADD KEY `fk_order_item_ingredients_ingredients` (`id_ingredients`);

--
-- Klíče pro tabulku `pizzas`
--
ALTER TABLE `pizzas`
  ADD PRIMARY KEY (`id_pizzas`);

--
-- Klíče pro tabulku `pizzas_tags`
--
ALTER TABLE `pizzas_tags`
  ADD KEY `fk_pizza_tags_pizzas` (`id_pizzas`),
  ADD KEY `fk_pizza_tags_tags` (`id_tags`);

--
-- Klíče pro tabulku `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id_tags`);

--
-- Klíče pro tabulku `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_users`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT pro tabulky
--

--
-- AUTO_INCREMENT pro tabulku `bases`
--
ALTER TABLE `bases`
  MODIFY `id_bases` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id_coupons` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `doughs`
--
ALTER TABLE `doughs`
  MODIFY `id_doughs` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `edges`
--
ALTER TABLE `edges`
  MODIFY `id_edges` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `ingredients`
--
ALTER TABLE `ingredients`
  MODIFY `id_ingredients` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pro tabulku `orders`
--
ALTER TABLE `orders`
  MODIFY `id_orders` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT pro tabulku `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id_order_items` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT pro tabulku `pizzas`
--
ALTER TABLE `pizzas`
  MODIFY `id_pizzas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pro tabulku `tags`
--
ALTER TABLE `tags`
  MODIFY `id_tags` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `users`
--
ALTER TABLE `users`
  MODIFY `id_users` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Omezení pro exportované tabulky
--

--
-- Omezení pro tabulku `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_doughs` FOREIGN KEY (`id_doughs`) REFERENCES `doughs` (`id_doughs`),
  ADD CONSTRAINT `fk_order_items_edges` FOREIGN KEY (`id_edges`) REFERENCES `edges` (`id_edges`),
  ADD CONSTRAINT `fk_order_items_orders` FOREIGN KEY (`id_orders`) REFERENCES `orders` (`id_orders`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_items_pizzas` FOREIGN KEY (`id_pizzas`) REFERENCES `pizzas` (`id_pizzas`);

--
-- Omezení pro tabulku `order_item_ingredients`
--
ALTER TABLE `order_item_ingredients`
  ADD CONSTRAINT `fk_order_item_ingredients_ingredients` FOREIGN KEY (`id_ingredients`) REFERENCES `ingredients` (`id_ingredients`),
  ADD CONSTRAINT `fk_order_item_ingredients_order_items` FOREIGN KEY (`id_order_items`) REFERENCES `order_items` (`id_order_items`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `pizzas_tags`
--
ALTER TABLE `pizzas_tags`
  ADD CONSTRAINT `fk_pizza_tags_pizzas` FOREIGN KEY (`id_pizzas`) REFERENCES `pizzas` (`id_pizzas`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pizza_tags_tags` FOREIGN KEY (`id_tags`) REFERENCES `tags` (`id_tags`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
