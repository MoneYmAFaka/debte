-- Load Arrayfield UI library with error handling
local Arrayfield
local success, result = pcall(function()
    return loadstring(game:HttpGet("https://raw.githubusercontent.com/UI-Interface/CustomFIeld/main/RayField.lua"))()
end)

if not success then
    warn("Failed to load Arrayfield UI library: " .. tostring(result))
    return
end
Arrayfield = success and result or nil

-- Initialize services
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer

if not LocalPlayer then
    warn("Player not found. Script aborted.")
    return
end

-- Toggle variables
local autoTapEnabled = false
local autoUpgradeEnabled = false
local autoRebirthEnabled = false

-- Stop events
local autoTapStopEvent = Instance.new("BindableEvent")
local autoUpgradeStopEvent = Instance.new("BindableEvent")
local autoRebirthStopEvent = Instance.new("BindableEvent")

-- Delay helpers
local function randomDelay(min, max)
    return task.wait(min + math.random() * (max - min))
end

local function fixedDelay(seconds)
    return task.wait(seconds)
end

-- Safe FireServer loop
local function safeFireServer(callback, delayType, minDelay, maxDelay, stopEvent, toggleFlag)
    local connection
    connection = stopEvent.Event:Connect(function()
        connection:Disconnect()
    end)
    task.spawn(function()
        while true do
            if not _G[toggleFlag] then
                stopEvent:Fire()
                break
            end
            pcall(callback)
            if delayType == "fixed" then
                fixedDelay(minDelay)
            else
                randomDelay(minDelay, maxDelay)
            end
            if not connection.Connected then break end
        end
    end)
end

-- Auto Tap with fixed 0.5 second delay
local function autoTap()
    _G["AutoTapFlag"] = autoTapEnabled
    safeFireServer(function()
        ReplicatedStorage:WaitForChild("Remotes", 9e9):WaitForChild("Clicker", 9e9):FireServer()
    end, "fixed", 0.5, nil, autoTapStopEvent, "AutoTapFlag")
end

-- Auto Upgrade (1-4)
local function autoUpgrade()
    _G["AutoUpgradeFlag"] = autoUpgradeEnabled
    safeFireServer(function()
        for i = 1, 4 do
            ReplicatedStorage:WaitForChild("Remotes", 9e9):WaitForChild("GemUpgrade", 9e9):FireServer(i)
            task.wait(0.15)
        end
    end, "fixed", 0.8, nil, autoUpgradeStopEvent, "AutoUpgradeFlag")
end

-- Auto Rebirth
local function autoRebirth()
    _G["AutoRebirthFlag"] = autoRebirthEnabled
    safeFireServer(function()
        ReplicatedStorage:WaitForChild("Remotes", 9e9):WaitForChild("Rebirth", 9e9):FireServer(1)
    end, "fixed", 1, nil, autoRebirthStopEvent, "AutoRebirthFlag")
end

-- Create UI Window
local Window = Arrayfield:CreateWindow({
    Name = "Auto Features Hub",
    LoadingTitle = "Loading Interface",
    LoadingSubtitle = "by xAI",
    ConfigurationSaving = {
        Enabled = true,
        FolderName = "AutoHub",
        FileName = "Config"
    }
})

-- Fix UISizeConstraint issues
local function fixUISizeConstraints(window)
    for _, element in pairs(window:GetDescendants()) do
        if element:IsA("UISizeConstraint") then
            if element.MaxSize.X < element.MinSize.X or element.MaxSize.Y < element.MinSize.Y then
                element.MaxSize = Vector2.new(
                    math.max(element.MaxSize.X, element.MinSize.X),
                    math.max(element.MaxSize.Y, element.MinSize.Y)
                )
            end
        end
    end
end

-- Main Tab and Section
local MainTab = Window:CreateTab("Main", 4483362458)
local MainSection = MainTab:CreateSection("Auto Features", false)

-- Auto Tap Toggle
MainTab:CreateToggle({
    Name = "Auto Tap",
    Info = "Continuously clicks (Clicker event) every 0.5 seconds.",
    CurrentValue = false,
    Flag = "AutoTap",
    Callback = function(Value)
        autoTapEnabled = Value
        if Value then
            autoTap()
        else
            autoTapStopEvent:Fire()
        end
    end,
})

-- Auto Upgrade Toggle
MainTab:CreateToggle({
    Name = "Auto Upgrade (All 4)",
    Info = "Loops upgrades 1–4 repeatedly.",
    CurrentValue = false,
    Flag = "AutoUpgrade",
    Callback = function(Value)
        autoUpgradeEnabled = Value
        if Value then
            autoUpgrade()
        else
            autoUpgradeStopEvent:Fire()
        end
    end,
})

-- Auto Rebirth Toggle
MainTab:CreateToggle({
    Name = "Auto Rebirth",
    Info = "Automatically rebirths (1 per loop).",
    CurrentValue = false,
    Flag = "AutoRebirth",
    Callback = function(Value)
        autoRebirthEnabled = Value
        if Value then
            autoRebirth()
        else
            autoRebirthStopEvent:Fire()
        end
    end,
})

-- Settings Tab
local SettingsTab = Window:CreateTab("Settings", 4483362458)
local SettingsSection = SettingsTab:CreateSection("UI Settings", false)

-- Close UI Key default: E
local closeKey = Enum.KeyCode.E
UserInputService.InputBegan:Connect(function(input)
    if input.KeyCode == closeKey then
        Window:Destroy()
    end
end)

SettingsTab:CreateInput({
    Name = "Close UI Key",
    Info = "Enter a key to close the UI (default: E).",
    PlaceholderText = "Enter Key",
    RemoveTextAfterFocusLost = false,
    Callback = function(Text)
        local key = Enum.KeyCode[Text:upper()]
        if key then
            closeKey = key
        end
    end,
})

-- Apply size fix
fixUISizeConstraints(Window)

-- Notification label
MainTab:CreateLabel("Auto Features Loaded! Ready to use.", MainSection)
