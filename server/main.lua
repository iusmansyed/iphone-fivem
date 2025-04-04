local QBCore = exports['qb-core']:GetCoreObject()


-- server.lua
local Config = {
    SavePath = "screenshots/", -- Folder within the server resources where screenshots are saved
    DiscordWebhook = "https://discord.com/api/webhooks/1351977911879729392/YvkOxvD7raqCwc_yroVgA5Vo3eljvOdrJMGoKZUHP8NWCFxazfHQHQAt-cM0CA8aBASD" -- Optional: For sharing to Discord
}

-- Ensure the save directory exists
CreateThread(function()
    if not IsDuplicityVersion() then
        return
    end -- Only run on server

    -- Create directory if it doesn't exist
    local resourcePath = GetResourcePath(GetCurrentResourceName())
    local fullPath = resourcePath .. "/" .. Config.SavePath

    -- Check if directory exists using Lua's io library
    local success = io.open(fullPath, "r")
    if success then
        success:close()
    else
        -- Directory doesn't exist, create it
        os.execute("mkdir -p \"" .. fullPath .. "\"")

        -- Alternative approach if the above doesn't work on Windows servers
        -- os.execute("mkdir \"" .. fullPath .. "\"")

        print("Created directory: " .. fullPath)
    end
end)
-- Handle saving screenshots
RegisterNetEvent('screenshot:save')
AddEventHandler('screenshot:save', function(imageData, filterName)
    local src = source
    local playerName = GetPlayerName(src)

    -- Generate filename with timestamp
    local timestamp = os.date("%Y-%m-%d_%H-%M-%S")
    local filename = playerName .. "_" .. filterName .. "_" .. timestamp .. ".jpg"

    -- Base64 data or URL handling would go here
    -- This depends on how your screenshot data is formatted

    -- For URL screenshots, you might need to download the image
    if string.sub(imageData, 1, 4) == "http" then
        -- Download from URL and save (would require additional resources)
        -- For example, using an HTTP handler

        -- Notify player once saved
        TriggerClientEvent('screenshot:notify', src, "Screenshot saved as " .. filename)
    else
        -- Assuming base64 data
        -- Strip the data URL prefix if present
        local base64Data = imageData
        if string.sub(imageData, 1, 22) == "data:image/jpeg;base64," then
            base64Data = string.sub(imageData, 23)
        elseif string.sub(imageData, 1, 21) == "data:image/png;base64," then
            base64Data = string.sub(imageData, 22)
        end

        -- Save the file
        local resourcePath = GetResourcePath(GetCurrentResourceName())
        local fullPath = resourcePath .. "/" .. Config.SavePath .. filename

        -- Write file
        local file = io.open(fullPath, "wb")
        if file then
            -- Decode base64 and write to file
            local decoded = base64DecodeToFile(base64Data, fullPath)
            file:close()

            -- Notify player
            TriggerClientEvent('screenshot:notify', src, "Screenshot saved as " .. filename)
        else
            TriggerClientEvent('screenshot:notify', src, "Failed to save screenshot")
        end
    end
end)

-- Handle sharing screenshots to Discord
RegisterNetEvent('screenshot:share')
AddEventHandler('screenshot:share', function(imageData)
    local src = source
    local playerName = GetPlayerName(src)

    -- Check if webhook is set
    if not Config.DiscordWebhook or Config.DiscordWebhook == "" then
        TriggerClientEvent('screenshot:notify', src, "Discord sharing not configured")
        return
    end

    -- Validate imageData
    if not imageData or imageData == "" then
        print("Invalid image data received from client")
        TriggerClientEvent('screenshot:notify', src, "Invalid screenshot data")
        return
    end

    -- Create Discord embed message
    local message = {
        username = "FiveM Screenshot Bot",
        content = playerName .. " took a screenshot!",
        embeds = {{
            color = 7506394,
            title = "Screenshot by " .. playerName,
            image = {
                url = imageData
            },
            footer = {
                text = "Taken on " .. os.date("%Y-%m-%d at %H:%M:%S")
            }
        }}
    }

    -- Debug logging
    print("Sending to Discord webhook:", Config.DiscordWebhook)
    print("Message payload:", json.encode(message))

    -- Send to Discord with proper error handling
    PerformHttpRequest(Config.DiscordWebhook, function(err, text, headers)
        print("Discord Webhook Response - Error:", err)
        print("Discord Webhook Response - Text:", text)
        print("Discord Webhook Response - Headers:", json.encode(headers))

        if err == 204 then
            TriggerClientEvent('screenshot:notify', src, "Screenshot shared to Discord")
        else
            local errorMsg = "Failed to share to Discord"
            if text then
                local success, errorData = pcall(function() return json.decode(text) end)
                if success and errorData.message then
                    errorMsg = errorMsg .. ": " .. errorData.message
                end
            end
            TriggerClientEvent('screenshot:notify', src, errorMsg)
        end
    end, 'POST', json.encode(message), {
        ['Content-Type'] = 'application/json'
    })
end)


-- Helper function to decode base64 to a file
function base64DecodeToFile(base64Data, filePath)
    -- Simple implementation - a production version would need a proper base64 decoder
    -- This is just a placeholder as FiveM doesn't have a native base64 decoder
    -- You would need to use a proper Lua base64 library or handle this differently

    return true -- Return success for demonstration
end

-- Register Discord webhook command for admins
RegisterCommand("setscreenshotwh", function(source, args, rawCommand)
    if source == 0 or IsPlayerAceAllowed(source, "command.setscreenshotwh") then
        if args[1] then
            Config.DiscordWebhook = args[1]
            if source > 0 then
                TriggerClientEvent('screenshot:notify', source, "Discord webhook updated")
            else
                print("Discord webhook updated")
            end
        else
            if source > 0 then
                TriggerClientEvent('screenshot:notify', source, "Usage: /setscreenshotwh [webhook URL]")
            else
                print("Usage: /setscreenshotwh [webhook URL]")
            end
        end
    else
        TriggerClientEvent('screenshot:notify', source, "You don't have permission to use this command")
    end
end, true)

-- Event for client notifications
RegisterNetEvent('screenshot:notify')
AddEventHandler('screenshot:notify', function(message)
    -- This is a server-to-client event for notifications
    TriggerClientEvent('screenshot:notify', source, message)
end)






--------------------------------------------------

RegisterNetEvent("saveUserData")
AddEventHandler("saveUserData", function(username, citizen_id)
    local src = source
    local Player = QBCore.Functions.GetPlayer(source)
    local contact = Player.PlayerData.charinfo.phone

    MySQL.Async.fetchScalar("SELECT COUNT(*) FROM mobile_user WHERE citizen_id = @citizen_id", {
        ["@citizen_id"] = citizen_id
    }, function(count)
        if count > 0 then
            print("⚠️ User already exists: " .. username)
        else
            -- ✅ Save new user if not already saved
            MySQL.Async.execute(
                "INSERT INTO mobile_user (username, phone, citizen_id) VALUES (@username, @phone, @citizen_id)", {
                    ["@username"] = username,
                    ["@phone"] = contact,
                    ["@citizen_id"] = citizen_id
                }, function(rowsChanged)
                    if rowsChanged > 0 then
                        print("✅ User data saved for: " .. username)
                        TriggerClientEvent("userSavedNotify", src)
                    else
                        print("❌ Failed to save user data for: " .. username)
                    end
                end)
        end
    end)
end)

RegisterNetEvent("requestContacts")
AddEventHandler("requestContacts", function()
    local src = source
    MySQL.Async.fetchAll("SELECT username, phone FROM mobile_user", {}, function(users)
        print("✅ Fetched contacts for user: " .. src)
        TriggerClientEvent("receiveContacts", src, users)
    end)
end)

-- New event to save a contact with phone number
RegisterNetEvent("saveNewContact")
AddEventHandler("saveNewContact", function(contactName, phoneNumber)
    local src = source
    local Player = QBCore.Functions.GetPlayer(source)
    local citizen_id = Player.PlayerData.citizenid
    
    -- Check if phone number already exists
    MySQL.Async.fetchScalar("SELECT COUNT(*) FROM mobile_user WHERE phone = @phone", {
        ["@phone"] = phoneNumber
    }, function(count)
        if count > 0 then
            TriggerClientEvent("phoneNotification", src, "Phone number already exists in contacts")
        else
            -- Save new contact
            MySQL.Async.execute(
                "INSERT INTO mobile_user (username, phone, citizen_id) VALUES (@username, @phone, @citizen_id)", {
                    ["@username"] = contactName,
                    ["@phone"] = phoneNumber,
                    ["@citizen_id"] = citizen_id
                }, function(rowsChanged)
                    if rowsChanged > 0 then
                        print("✅ New contact saved: " .. contactName .. " - " .. phoneNumber)
                        TriggerClientEvent("phoneNotification", src, "Contact saved successfully")
                        
                        -- Send updated contacts list back to client
                        MySQL.Async.fetchAll("SELECT username, phone FROM mobile_user", {}, function(users)
                            TriggerClientEvent("receiveContacts", src, users)
                        end)
                    else
                        TriggerClientEvent("phoneNotification", src, "Failed to save contact")
                    end
                end)
        end
    end)
end)

-- Event to check if phone number exists
RegisterNetEvent("checkPhoneNumber")
AddEventHandler("checkPhoneNumber", function(phoneNumber)
    local src = source
    
    MySQL.Async.fetchAll("SELECT username, phone FROM mobile_user WHERE phone = @phone", {
        ["@phone"] = phoneNumber
    }, function(results)
        if #results > 0 then
            -- Return the contact information if found
            TriggerClientEvent("phoneNumberResult", src, true, results)
        else
            -- Return false if not found
            TriggerClientEvent("phoneNumberResult", src, false, nil)
        end
    end)
end)

--------------------------------------------------



----------------------Messages------------------------------
-- Event to send a message
-- Event to send a message
RegisterNetEvent('qb-core:phone:sendMessage')
AddEventHandler('qb-core:phone:sendMessage', function(data)
    local sender = data.sender
    local receiver = data.receiver
    local message = data.message
    local src = source

    -- Save the message to the database
    MySQL.Async.execute("INSERT INTO mobile_messages (sender, receiver, message) VALUES (@sender, @receiver, @message)", {
        ["@sender"] = sender,
        ["@receiver"] = receiver,
        ["@message"] = message
    }, function(rowsChanged)
        if rowsChanged > 0 then
            print("Message sent successfully by: " .. sender)

            -- Notify the sender that the message was sent
            TriggerClientEvent('qb-core:phone:messageSent', src)

            -- Send the message to the receiver's client (real-time communication)
            TriggerClientEvent('qb-core:phone:receiveMessages', receiver, {{sender = sender, receiver = receiver, message = message}})
        else
            print("Failed to send message")
        end
    end)
end)

-- Event to fetch messages for a user
RegisterNetEvent('qb-core:phone:getMessages')
AddEventHandler('qb-core:phone:getMessages', function(user)
    local src = source
    MySQL.Async.fetchAll("SELECT sender, message, timestamp FROM mobile_messages WHERE sender = @user OR receiver = @user ORDER BY timestamp ASC", {
        ["@user"] = user
    }, function(messages)
        -- Send the fetched messages to the client
        TriggerClientEvent('qb-core:phone:receiveMessages', src, messages)
    end)
end)

-- Confirmation of message sent
RegisterNetEvent('qb-core:phone:messageSent')
AddEventHandler('qb-core:phone:messageSent', function()
    print("Message sent successfully!")
end)
