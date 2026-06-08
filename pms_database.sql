-- ============================================
-- PMS DATABASE - SwiftWheels Enterprises
-- TSS National Integrated Assessment 2025-2026
-- Run this in phpMyAdmin or MySQL CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS PMS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE PMS;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('admin', 'staff', 'manager') NOT NULL DEFAULT 'staff',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- VEHICLE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS Vehicle (
    Plate_Number VARCHAR(20) PRIMARY KEY,
    Brand VARCHAR(100) NOT NULL,
    Model VARCHAR(100) NOT NULL,
    Year YEAR NOT NULL,
    Vehicle_Type ENUM('Sedan', 'SUV', 'Truck', 'Van', 'Bus', 'Motorcycle', 'Pickup') NOT NULL,
    Purchase_Price DECIMAL(12, 2) NOT NULL,
    Status ENUM('Available', 'Rented', 'Sold', 'Maintenance') NOT NULL DEFAULT 'Available',
    UserID INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- ============================================
-- CUSTOMER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS Customer (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive', 'Blocked') NOT NULL DEFAULT 'Active',
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- ============================================
-- PROMOTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS Promotion (
    PromotionID INT AUTO_INCREMENT PRIMARY KEY,
    Title ENUM(
        'New Year Sale',
        'Holiday Price Slash',
        'Weekend Flash Sale',
        'Clearance Discount Offer',
        'Seasonal Price Drop'
    ) NOT NULL,
    Description TEXT,
    Discount_Type ENUM('free', 'percentage', 'FLAT_RATE', 'CASHBACK', 'BUY_ONE_GET_ONE', 'Bundle and amount') NOT NULL,
    Discount_Value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    Start_Date DATE NOT NULL,
    End_Date DATE NOT NULL,
    Status ENUM('Active', 'Inactive', 'Expired') NOT NULL DEFAULT 'Active',
    UserID INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- ============================================
-- PROMOTION_VEHICLE TABLE (Junction)
-- ============================================
CREATE TABLE IF NOT EXISTS Promotion_Vehicle (
    PV_ID INT AUTO_INCREMENT PRIMARY KEY,
    PromotionID INT NOT NULL,
    Plate_Number VARCHAR(20) NOT NULL,
    Performance ENUM('Excellent', 'Good', 'Average', 'Poor') NOT NULL DEFAULT 'Good',
    AssignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PromotionID) REFERENCES Promotion(PromotionID) ON DELETE CASCADE,
    FOREIGN KEY (Plate_Number) REFERENCES Vehicle(Plate_Number) ON DELETE CASCADE,
    UNIQUE KEY unique_promo_vehicle (PromotionID, Plate_Number)
);

-- ============================================
-- SEED DATA
-- ============================================

-- Default Admin User (password: admin123 - bcrypt hashed)
INSERT INTO Users (UserName, Password, Role) VALUES
('admin', '$2b$10$7Nuk4XzX7SdMKADM8/wareV5PLAgz0NmV8phGhz2tRVYvOE1Z.01G.', 'admin'),
('manager', '$2b$10$7Nuk4XzX7SdMKADM8/wareV5PLAgz0NmV8phGhz2tRVYvOE1Z.01G.', 'manager'),
('staff', '$2b$10$7Nuk4XzX7SdMKADM8/wareV5PLAgz0NmV8phGhz2tRVYvOE1Z.01G', 'staff');

-- Vehicles
INSERT INTO Vehicle (Plate_Number, Brand, Model, Year, Vehicle_Type, Purchase_Price, Status, UserID) VALUES
('RAC 001A', 'Toyota', 'Land Cruiser', 2022, 'SUV', 85000.00, 'Available', 1),
('RAB 002B', 'Toyota', 'Hilux', 2021, 'Pickup', 45000.00, 'Available', 1),
('RAC 003C', 'Nissan', 'Patrol', 2023, 'SUV', 95000.00, 'Rented', 1),
('RAB 004D', 'Mercedes', 'Sprinter', 2020, 'Van', 60000.00, 'Available', 2),
('RAC 005E', 'Toyota', 'Corolla', 2022, 'Sedan', 28000.00, 'Available', 2),
('RAB 006F', 'Hyundai', 'H1', 2021, 'Van', 35000.00, 'Maintenance', 1);

-- Customers
INSERT INTO Customer (FirstName, LastName, Email, PhoneNumber, Status, UserID) VALUES
('Jean', 'Uwimana', 'jean.uwimana@email.com', '+250788123456', 'Active', 1),
('Marie', 'Mukamana', 'marie.mukamana@email.com', '+250722987654', 'Active', 1),
('Patrick', 'Nzeyimana', 'p.nzeyimana@email.com', '+250788456789', 'Active', 2),
('Alice', 'Ingabire', 'alice.ingabire@email.com', '+250722111222', 'Inactive', 1),
('David', 'Habimana', 'd.habimana@email.com', '+250788333444', 'Active', 2),
('Grace', 'Iradukunda', 'grace.ira@email.com', '+250722555666', 'Blocked', 1);

-- Promotions
INSERT INTO Promotion (Title, Description, Discount_Type, Discount_Value, Start_Date, End_Date, Status, UserID) VALUES
('New Year Sale', 'Celebrate new year with amazing vehicle deals!', 'percentage', 15.00, '2026-01-01', '2026-01-31', 'Expired', 1),
('Weekend Flash Sale', 'This weekend only - incredible savings on select vehicles', 'FLAT_RATE', 5000.00, '2026-06-07', '2026-06-08', 'Active', 1),
('Holiday Price Slash', 'Holiday season discounts on all SUVs', 'percentage', 20.00, '2026-12-20', '2026-12-31', 'Inactive', 2),
('Clearance Discount Offer', 'Clear stock with unbeatable prices', 'CASHBACK', 3000.00, '2026-05-01', '2026-06-30', 'Active', 1),
('Seasonal Price Drop', 'End of season great deals', 'Bundle and amount', 10000.00, '2026-03-01', '2026-03-31', 'Expired', 2);

-- Promotion_Vehicle
INSERT INTO Promotion_Vehicle (PromotionID, Plate_Number, Performance) VALUES
(1, 'RAC 001A', 'Excellent'),
(1, 'RAB 002B', 'Good'),
(2, 'RAC 003C', 'Good'),
(2, 'RAC 005E', 'Excellent'),
(3, 'RAC 001A', 'Average'),
(3, 'RAC 003C', 'Good'),
(4, 'RAB 004D', 'Excellent'),
(4, 'RAB 006F', 'Poor'),
(5, 'RAB 002B', 'Good');

-- ============================================
-- REPORT VIEW
-- ============================================
CREATE OR REPLACE VIEW vw_Customer_Promotion_Report AS
SELECT
    c.CustomerID,
    CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
    c.Email,
    c.PhoneNumber,
    c.Status AS CustomerStatus,
    v.Brand AS VehicleBrand,
    v.Model AS VehicleModel,
    v.Plate_Number,
    v.Vehicle_Type,
    p.Title AS PromotionTitle,
    p.Discount_Type,
    p.Discount_Value,
    pv.Performance
FROM Customer c
CROSS JOIN Vehicle v
JOIN Promotion_Vehicle pv ON pv.Plate_Number = v.Plate_Number
JOIN Promotion p ON p.PromotionID = pv.PromotionID
WHERE c.Status = 'Active' AND p.Status = 'Active';
