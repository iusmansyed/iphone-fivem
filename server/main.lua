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

-----------------------------------pma voice

-----------------------------------pma voice
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

        else
            -- ✅ Save new user if not already saved
            MySQL.Async.execute(
                "INSERT INTO mobile_user (username, phone, citizen_id) VALUES (@username, @phone, @citizen_id)", {
                    ["@username"] = username,
                    ["@phone"] = contact,
                    ["@citizen_id"] = citizen_id
                }, function(rowsChanged)
                    if rowsChanged > 0 then
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
    MySQL.Async.fetchScalar('SELECT COUNT(*) FROM group_members WHERE group_id = @group_id AND username = @username', {
        ['@group_id'] = groupId,
        ['@username'] = member.username
    }, function(count)
        if count and tonumber(count) > 0 then
            print("⚠️ Member already exists in the group. Not adding again.")
        else
            -- If not exists, add the member
            MySQL.Async.execute(
                'INSERT INTO group_members (group_id, username, phone) VALUES (@group_id, @username, @phone)', {
                    ['@group_id'] = groupId,
                    ['@username'] = member.username,
                    ['@phone'] = member.phone
                }, function(rowsChanged)
                    if rowsChanged > 0 then
                        print("✅ Member added to group!")
                    else
                        print("❌ Failed to add member")
                    end
                end)
        end
    end)
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

    MySQL.Async.execute('DELETE FROM group_members WHERE group_id = @group_id AND username = @username', {
        ['@group_id'] = groupId,
        ['@username'] = username
    }, function(rowsChanged)
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
    end)
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
-- signup

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
            MySQL.Async.execute(
                "INSERT INTO instagram_users (username, email, password) VALUES (@username, @email, @password)", {
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

-- login
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
                    id = user.id,
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
RegisterServerEvent("insta:GetAllUsersInfo")
AddEventHandler("insta:GetAllUsersInfo", function(data)
    local src = source
    MySQL.Async.fetchAll("SELECT * FROM instagram_users WHERE id = ?", {data.userId}, function(users)
        TriggerClientEvent("instagram:loadInstaAllUsers", src, users)
    end)
end)
RegisterServerEvent("insta:AllUsersGet")
AddEventHandler("insta:AllUsersGet", function(data)
    local src = source
    MySQL.Async.fetchAll("SELECT * FROM instagram_users WHERE username != @username", {
        ['@username'] = data.username
    }, function(users)
        TriggerClientEvent("instagram:loadAllUsers", src, users)
    end)
end)

RegisterServerEvent("insta:uploadPost")
AddEventHandler("insta:uploadPost", function(data)
    local src = source
    local username = data.username
    local caption = data.caption
    local image = data.image

    MySQL.Async.execute("INSERT INTO instagram_posts (username, image, caption) VALUES (@username, @image, @caption)",
        {
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
    MySQL.Async.fetchAll("SELECT * FROM instagram_posts ORDER BY id DESC", {}, function(posts)
        local updatedPosts = {}

        for _, post in ipairs(posts) do
            local postId = post.id

            -- Get counts
            local likes = MySQL.Sync.fetchScalar("SELECT COUNT(*) FROM instagram_likes WHERE post_id = @post_id", {
                ["@post_id"] = postId
            }) or 0
            local comments = MySQL.Sync.fetchScalar("SELECT COUNT(*) FROM instagram_comments WHERE post_id = @post_id",
                {
                    ["@post_id"] = postId
                }) or 0
            -- local shares = MySQL.Sync.fetchScalar("SELECT COUNT(*) FROM instagram_shares WHERE post_id = @post_id", {["@post_id"] = postId}) or 0

            post.likeCount = likes
            post.commentCount = comments
          

            table.insert(updatedPosts, post)
        end

        TriggerClientEvent("insta:loadPosts", source, updatedPosts)
    end)
end)

RegisterServerEvent("insta:likePost")
AddEventHandler("insta:likePost", function(data)
    local src = source
    print("likes post", json.encode(data.postId))

    MySQL.Async.fetchScalar("SELECT COUNT(*) FROM instagram_likes WHERE post_id = @post_id AND username = @username", {
        ['@post_id'] = data.postId,
        ['@username'] = data.username
    }, function(count)
        if count > 0 then
            -- Already liked → remove like (unlike)
            MySQL.Async.execute("DELETE FROM instagram_likes WHERE post_id = @post_id AND username = @username", {
                ['@post_id'] = data.postId,
                ['@username'] = data.username
            }, function(rowsChanged)
                if rowsChanged > 0 then
                    print("❌ Post unliked by: " .. data.username)
                    TriggerClientEvent("insta:postUnliked", -1, data.postId)

                end
            end)
        else
            -- Not liked yet → add like
            MySQL.Async.execute("INSERT INTO instagram_likes (post_id, username) VALUES (@post_id, @username)", {
                ['@post_id'] = data.postId,
                ['@username'] = data.username
            }, function(rowsChanged)
                if rowsChanged > 0 then
                    print("✅ Post liked by: " .. data.username)
                    TriggerClientEvent("insta:postLiked", -1, data.postId)
                end
            end)
        end
    end)
end)
local function broadcastLikeCount(postId)
    MySQL.Async.fetchScalar("SELECT COUNT(*) FROM instagram_likes WHERE post_id = @post_id", {
        ['@post_id'] = postId
    }, function(count)
        -- 🔁 Send updated count to all clients
        TriggerClientEvent("insta:updateLikeCount", -1, {
            postId = postId,
            likeCount = count
        })
    end)
end

RegisterServerEvent("insta:addComment")
AddEventHandler("insta:addComment", function(data)
    local src = source
    local username = GetPlayerName(src)
    print("comment post", json.encode(data))
    MySQL.Async.execute(
        "INSERT INTO instagram_comments (post_id, comment, username) VALUES (@post_id, @comment, @username)", {
            ['@post_id'] = data.post_id,
            ['@comment'] = data.comment,
            ['@username'] = data.username
        })
end)

RegisterServerEvent("insta:getComments")
AddEventHandler("insta:getComments", function(postId)
    local src = source
    MySQL.Async.fetchAll("SELECT * FROM instagram_comments WHERE post_id = @post_id", {
        ['@post_id'] = postId.postId
    }, function(comments)
        TriggerClientEvent("insta:sendComments", src, postId, comments)
    end)
end)

-- story section
RegisterServerEvent("insta:uploadStory")
AddEventHandler("insta:uploadStory", function(data)
    local src = source
    local username = GetPlayerName(src)

    -- Expiry 24 hours from now
    local expires_at = os.date("%Y-%m-%d %H:%M:%S", os.time() + (24 * 60 * 60))

    MySQL.Async.execute(
        "INSERT INTO instagram_stories (username, image, expires_at) VALUES (@username, @image, @expires_at)", {
            ["@username"] = data.username,
            ["@image"] = data.image,
            ["@expires_at"] = expires_at
        }, function(rowsChanged)
            if rowsChanged > 0 then
                TriggerClientEvent("insta:storyUploaded", src, {
                    success = true
                })
            else
                TriggerClientEvent("insta:storyUploaded", src, {
                    success = false
                })
            end
        end)
end)

RegisterServerEvent("insta:getStories")
AddEventHandler("insta:getStories", function()
    local src = source
    local username = GetPlayerName(src)
    MySQL.Async.fetchAll(
        "SELECT * FROM instagram_stories WHERE created_at >= NOW() - INTERVAL 1 DAY ORDER BY created_at DESC", {},
        function(result)
            TriggerClientEvent("insta:loadStories", src, {
                type = "loadStories",
                username = username,
                stories = result
            })
        end)
end)

-- story section

-- FOLLOWERS AND FOLLOWING
-- FOLLOW
RegisterNetEvent("insta:followUser")
AddEventHandler("insta:followUser", function(data)
    MySQL.Async.execute("INSERT INTO instagram_followers (follower_id, following_id) VALUES (@follower, @following)", {
        ['@follower'] = data.followerId,
        ['@following'] = data.followingId
    })
end)

-- UNFOLLOW
RegisterNetEvent("insta:unfollowUser")
AddEventHandler("insta:unfollowUser", function(data)
    MySQL.Async.execute("DELETE FROM instagram_followers WHERE follower_id = @follower AND following_id = @following", {
        ['@follower'] = data.followerId,
        ['@following'] = data.followingId
    })
end)

-- GET FOLLOWING COUNT
RegisterNetEvent("instagram:getFollowerData")
AddEventHandler("instagram:getFollowerData", function(userId)
    local src = source

    -- Get followers (users who follow me)
    MySQL.Async.fetchAll("SELECT follower_id FROM instagram_followers WHERE following_id = @id", {
        ['@id'] = userId.userId
    }, function(followers)
        local followersIds = {}
        for i, row in ipairs(followers) do
            print("followers", json.encode(row.follower_id))
            table.insert(followersIds, row.follower_id)
        end

        -- Get followings (users I follow)
        MySQL.Async.fetchAll("SELECT following_id FROM instagram_followers WHERE follower_id = @id", {
            ['@id'] = userId.userId
        }, function(followings)
            local followingIds = {}
            for i, row in ipairs(followings) do
                print("followeing", json.encode(row.following_id))
                table.insert(followingIds, row.following_id)
            end

            -- Send arrays to client
            TriggerClientEvent("instagram:receiveFollowerData", src, followersIds, followingIds)
        end)
    end)
end)

-- FOLLOWERS AND FOLLOWING

-- update proflie
RegisterServerEvent("insta:updateProfile")
AddEventHandler("insta:updateProfile", function(data)
    print("Updating profile data: " .. json.encode(data))
    local src = source

    local image = data.image
    local userId = data.userId
    local query = "UPDATE instagram_users SET image = @image WHERE id = @id"
    local params = {
        ["@image"] = data.profile,
        ["@id"] = userId
    }
    MySQL.Async.execute(query, params, function(rowsChanged)
        if rowsChanged > 0 then
            print("✅ Profile updated for user ID: " .. data.userId)
            TriggerClientEvent("insta:profileUpdated", src, true)
        else
            print("❌ Failed to update profile for user ID: " .. data.userId)
            TriggerClientEvent("insta:profileUpdated", src, false)
        end
    end)

end)

RegisterServerEvent("insta:getMyPosts")
AddEventHandler("insta:getMyPosts", function(data)
    print(json.encode(data))
    local src = source

    MySQL.Async.fetchAll("SELECT * FROM instagram_posts WHERE username = @username", {
        ["@username"] = data.username
    }, function(posts)
        local updatedPosts = {}

        for _, post in ipairs(posts) do
            local postId = post.id

            -- Get counts
            local likes = MySQL.Sync.fetchScalar("SELECT COUNT(*) FROM instagram_likes WHERE post_id = @post_id", {
                ["@post_id"] = postId
            }) or 0

            local comments = MySQL.Sync.fetchScalar("SELECT COUNT(*) FROM instagram_comments WHERE post_id = @post_id", {
                ["@post_id"] = postId
            }) or 0

            -- Add counts to post
            post.likeCount = likes
            post.commentCount = comments

            table.insert(updatedPosts, post)
        end

        TriggerClientEvent("insta:postFetched", src, updatedPosts)
    end)
end)


-- update proflie

---------------------instagram

------------------calll
local QBCore = exports['qb-core']:GetCoreObject()

RegisterServerEvent('phone:call')
AddEventHandler('phone:call', function(targetNumber)
    local src = source
    local xPlayer = QBCore.Functions.GetPlayer(src)
    local Player = QBCore.Functions.GetPlayerByPhone(targetNumber)

    if Player.Offline == false then
        local targetSrc = Player.PlayerData.source
        print("📞 Target player is online. Src: " .. targetSrc)

        -- You can pass the caller's phone number or name
        TriggerClientEvent('phone:incomingCall', targetSrc, xPlayer.PlayerData.charinfo.phone, src)

        TriggerClientEvent('phone:callStarted', src, targetSrc)
    else
        print("❌ Target player is offline.")
        TriggerClientEvent('phone:playerOffline', src)
    end
end)

-- Dummy function: replace this with your own logic to get citizenid from phone number
function GetCitizenIdFromPhoneNumber(phone)
    print("🔍 Looking up citizen ID for phone number: " .. tostring(phone))
    local result = MySQL.Sync.fetchAll('SELECT citizen_id FROM mobile_user WHERE phone = ?', {phone})
    if result[1] then
        print("✅ Citizen ID found: " .. json.encode(result[1].citizen_id))
        return result[1].citizen_id
    else
        print("❌ No citizen ID found for phone number: " .. tostring(phone))
    end
    return nil
end

RegisterServerEvent('phone:callEnded')
AddEventHandler('phone:callEnded', function(targetSrc)
    local src = source
    local xPlayer = QBCore.Functions.GetPlayer(src)

    local sender = xPlayer.PlayerData.charinfo.phone

    local time = os.date("%Y-%m-%d %H:%M:%S")
    MySQL.Async.execute('INSERT INTO phone_call_logs (caller, receiver, time, status) VALUES (?, ?, ?, ?)',
        {sender, targetSrc.number, time, "declined"})
end)

RegisterServerEvent('phone:getContactInfo')
AddEventHandler('phone:getContactInfo', function(contactNumber)
    local src = source
    local xPlayer = QBCore.Functions.GetPlayer(src)
    local sender = xPlayer.PlayerData.charinfo.phone

    MySQL.Async.fetchAll('SELECT * FROM phone_call_logs WHERE caller = ?', {sender}, function(result)
        if result and #result > 0 then
            print("📞 Call logs found for caller: " .. json.encode(result))
            TriggerClientEvent('phone:sendContactInfo', src, result) -- send full result
        else
            TriggerClientEvent('phone:sendContactInfo', src, nil)
        end
    end)
end)

------------------calll
