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
                local success, errorData = pcall(function()
                    return json.decode(text)
                end)
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
RegisterNetEvent('qb-core:phone:sendMessage')
AddEventHandler('qb-core:phone:sendMessage', function(data)
    print("Received message data: " .. json.encode(data))
    local sender = data.sender
    local receiver = data.receiver
    local message = data.message
    local src = source

    -- Insert the message as an individual entry in the database
    MySQL.Async.execute("INSERT INTO mobile_messages (sender, receiver, message) VALUES (@sender, @receiver, @message)",
        {
            ["@sender"] = sender,
            ["@receiver"] = receiver,
            ["@message"] = message
        }, function(rowsChanged)
            if rowsChanged > 0 then
                print("Message saved individually")
                -- Trigger event to notify message sent
                TriggerClientEvent('qb-core:phone:messageSent', src)
                -- Send the message to the clients
                TriggerClientEvent('qb-core:phone:receiveMessages', -1, {{
                    sender = sender,
                    receiver = receiver,
                    message = message
                }})
            else
                print("Failed to save message")
            end
        end)
end)

-- Load previous messages for a user
RegisterNetEvent('qb-core:phone:getMessages')
AddEventHandler('qb-core:phone:getMessages', function(chatUser)
    local src = source
    local username = GetPlayerName(src)
    local recievername = chatUser.sender
    local cleanedReceiverName = json.decode(recievername)
    print("USERNAME DEBUG:", username)
    print("RECEIVER DEBUG:", recievername)

    MySQL.Async.fetchAll(
        "SELECT * FROM mobile_messages WHERE (sender = @user AND receiver = @chatUser) OR (sender = @chatUser AND receiver = @user) ORDER BY id ASC",
        {
            ["@user"] = username,
            ["@chatUser"] = cleanedReceiverName
        }, function(results)
            if results and #results > 0 then
                TriggerClientEvent('qb-core:phone:receiveMessages', src, results)
            else
                print("❌ No messages found between " .. username .. " and " .. recievername)
                TriggerClientEvent('qb-core:phone:receiveMessages', src, {})
            end
        end)
end)

------------------------------------gc
-- Server Side (Lua)

-- Register an event to receive the group data from the client
-- Server-Side (Lua): Receiving Group Data

RegisterServerEvent("group:create")
AddEventHandler("group:create", function(data)
    local groupName = data.name
    local members = data.members

    -- Insert group name first
    MySQL.Async.execute('INSERT INTO groups (name) VALUES (@name)', {
        ['@name'] = groupName
    }, function(rowsChanged)
        if rowsChanged > 0 then
            -- Get the last inserted group ID
            MySQL.Async.fetchScalar('SELECT id FROM groups WHERE name = @name ORDER BY id DESC LIMIT 1', {
                ['@name'] = groupName
            }, function(groupId)
                if groupId then
                    -- Insert each member
                    for _, member in ipairs(members) do
                        MySQL.Async.execute(
                            'INSERT INTO group_members (group_id, username, phone) VALUES (@group_id, @username, @phone)',
                            {
                                ['@group_id'] = groupId,
                                ['@username'] = member.username,
                                ['@phone'] = member.phone
                            })
                    end
                    print("✅ Group and members saved!")
                else
                    print("❌ Could not fetch group ID")
                end
            end)
        else
            print("❌ Failed to insert group")
        end
    end)
end)

--------------------add new user functionality
RegisterServerEvent("group:addMember")
AddEventHandler("group:addMember", function(data)
    local groupId = data.groupId
    local member = data.member -- { username = "", phone = "" }

    -- First check if the member already exists in this group
    MySQL.Async.fetchScalar(
        'SELECT COUNT(*) FROM group_members WHERE group_id = @group_id AND username = @username',
        {
            ['@group_id'] = groupId,
            ['@username'] = member.username
        },
        function(count)
            if count and tonumber(count) > 0 then
                print("⚠️ Member already exists in the group. Not adding again.")
            else
                -- If not exists, add the member
                MySQL.Async.execute(
                    'INSERT INTO group_members (group_id, username, phone) VALUES (@group_id, @username, @phone)',
                    {
                        ['@group_id'] = groupId,
                        ['@username'] = member.username,
                        ['@phone'] = member.phone
                    },
                    function(rowsChanged)
                        if rowsChanged > 0 then
                            print("✅ Member added to group!")
                        else
                            print("❌ Failed to add member")
                        end
                    end
                )
            end
        end
    )
end)


--------------------add new user functionality
-----------------------remove user functionality
RegisterServerEvent("group:removeMember")
AddEventHandler("group:removeMember", function(data)
    local src = source
    local groupId = data.groupId
    local username = data.username

    if not groupId or not username then
        TriggerClientEvent("group:memberRemoved", src, false, "Missing group ID or username")
        return
    end

    MySQL.Async.execute(
        'DELETE FROM group_members WHERE group_id = @group_id AND username = @username',
        {
            ['@group_id'] = groupId,
            ['@username'] = username
        },
        function(rowsChanged)
            if rowsChanged > 0 then
                print("✅ Member removed from group!")
                TriggerClientEvent("group:memberRemoved", src, true, "Member removed successfully")
                
                -- Refresh the group members list for all clients
                MySQL.Async.fetchAll("SELECT username, phone FROM group_members WHERE group_id = @group_id", {
                    ['@group_id'] = groupId
                }, function(members)
                    TriggerClientEvent("group:receiveGroupMembers", src, members)
                end)
            else
                print("❌ Member not found or already removed")
                TriggerClientEvent("group:memberRemoved", src, false, "Member not found or already removed")
            end
        end
    )
end)

-----------------------remove user functionality
------------------------------------gc

-------------------------------gc arahy hain database se
RegisterServerEvent("group:getList")
AddEventHandler("group:getList", function()
    local src = source -- ✅ correct way to get the source player ID

    MySQL.Async.fetchAll("SELECT id, name, timestamp FROM groups", {}, function(groups)
        print("✅ Server: Sending group list to", src)
        TriggerClientEvent("group:receiveGroupList", src, groups)
    end)
end)

RegisterServerEvent("getGroupMembers")
AddEventHandler("getGroupMembers", function(data)
    local src = source
    local groupId = data.groupId
    print("gropup members data , " .. groupId)

    MySQL.Async.fetchAll("SELECT username, phone FROM group_members WHERE group_id = @group_id", {
        ['@group_id'] = groupId
    }, function(members)
        TriggerClientEvent("group:receiveGroupMembers", src, members)
    end)
end)

RegisterServerEvent("group:sendMessage")
AddEventHandler("group:sendMessage", function(data)
    local src = source
    local sender = GetPlayerName(src)
    local groupId = data.groupId
    local message = data.message

    -- Save message in database
    MySQL.Async.execute("INSERT INTO group_messages (group_id, sender, message) VALUES (@group_id, @sender, @message)",
        {
            ["@group_id"] = groupId,
            ["@sender"] = sender,
            ["@message"] = message
        }, function(rowsChanged)
            if rowsChanged > 0 then
                print("💾 Message saved from", sender)

                -- Send message to all players (you can filter by group if needed)
                TriggerClientEvent("group:receiveMessage", -1, {
                    sender = sender,
                    groupId = groupId,
                    message = message
                })
            else
                print("❌ Failed to save message")
            end
        end)
end)
RegisterServerEvent("group:getMessages")
AddEventHandler("group:getMessages", function(groupId)
    local src = source
    MySQL.Async.fetchAll(
        "SELECT sender, message, timestamp FROM group_messages WHERE group_id = @groupId ORDER BY timestamp ASC", {
            ["@groupId"] = groupId
        }, function(messages)
            TriggerClientEvent("group:loadMessages", src, {
                action = "loadGroupMessages",
                messages = messages
            })
        end)
end)
-------------------------------gc arahy hain database se
























---------------------instagram
--signup

RegisterServerEvent("insta:registerUser")
AddEventHandler("insta:registerUser", function(data)
    local src = source
    local username = data.username
    local email = data.email
    local password = data.password

    -- Check if username exists
    MySQL.Async.fetchScalar("SELECT username FROM instagram_users WHERE username = @username", {
        ['@username'] = username
    }, function(result)
        if result then
            print("❌ Username already exists: " .. username)
            -- Optionally send error to client
        else
            -- Insert user
            MySQL.Async.execute("INSERT INTO instagram_users (username, email, password) VALUES (@username, @email, @password)", {
                ['@username'] = username,
                ['@email'] = email,
                ['@password'] = password
            }, function(rowsChanged)
                print("✅ Registered new user: " .. username)
                -- Trigger login success or next steps here
            end)
        end
    end)
end)


--login
RegisterServerEvent("insta:loginUser")
AddEventHandler("insta:loginUser", function(data)
    local src = source
    local username = data.username
    local password = data.password

    MySQL.Async.fetchAll("SELECT * FROM instagram_users WHERE username = @username", {
        ['@username'] = username
    }, function(result)
        if result and result[1] then
            local user = result[1]

            -- ✅ Match both username and password
            if user.username == username and user.password == password then
                print("✅ Login successful for: " .. username)

                TriggerClientEvent("instagram:loginSuccess", src, {
                    username = user.username,
                    email = user.email,
                    password = user.password
                })
            else
                print("❌ Username or Password incorrect for: " .. username)
                TriggerClientEvent("instagram:loginFailed", src, "❌ Username or Password incorrect for: " .. username)

            end
        else
            print("❌ Username not found: " .. username)
            TriggerClientEvent("instagram:loginFailed", src, "❌ Username or Password incorrect for: " .. username)
        end
    end)
end)




RegisterServerEvent("insta:uploadPost")
AddEventHandler("insta:uploadPost", function(data)
    local src = source
    local username = data.username
    local caption = data.caption
    local image = data.image

    MySQL.Async.execute("INSERT INTO instagram_posts (username, image, caption) VALUES (@username, @image, @caption)", {
        ["@username"] = username,
        ["@image"] = image,
        ["@caption"] = caption
    }, function(rowsChanged)
        print("✅ Post uploaded by: " .. username)
        TriggerClientEvent("instagram:postUploaded", src)
    end)
end)


RegisterServerEvent("insta:getAllPosts")
AddEventHandler("insta:getAllPosts", function(src)
    local source = src or source
    MySQL.Async.fetchAll("SELECT * FROM instagram_posts ORDER BY id DESC", {}, function(result)
        print("printing details",json.encode(result))
        TriggerClientEvent("insta:loadPosts", source, result)
    end)
end)
---------------------instagram