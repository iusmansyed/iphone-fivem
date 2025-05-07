local QBCore = exports['qb-core']:GetCoreObject()

local batteryLevel = 50
local charging = false

-- Function to charge battery
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(5000) -- Check every 5 seconds
        local playerPed = PlayerPedId()
        local inVehicle = IsPedInAnyVehicle(playerPed, false)

        if inVehicle then
            charging = true
            batteryLevel = math.min(100, batteryLevel + 5) -- Increase battery
        else
            charging = false
            batteryLevel = math.max(0, batteryLevel - 2) -- Slowly drain battery
        end

        -- Send data to NUI
        SendNUIMessage({
            action = "updateBattery",
            level = batteryLevel,
            charging = charging
        })
    end
end)
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        SetNuiFocus(true, true)

    end
end)

-----------------------------------
-- client.lua
local display = false
local uiReady = false
local cameraProp = nil

-- Configuration
local Config = {
    Command = "screenshot", -- Command to open the screenshot UI
    SavePath = "screenshots/", -- Folder within the server resources where screenshots are saved
    Filters = {
        normal = {},
        vintage = {
            contrast = 1.2,
            brightness = 0.9,
            saturation = 0.8
        },
        noir = {
            grayscale = true,
            contrast = 1.4,
            brightness = 0.9
        },
        vivid = {
            contrast = 1.4,
            saturation = 1.5,
            brightness = 1.1
        }
    }
}

-- Register command to open screenshot tool
RegisterCommand(Config.Command, function()
    OpenScreenshotUI()
end, false)

-- Open the screenshot UI
function OpenScreenshotUI()
    if not uiReady then
        -- Load the UI first
        SendNUIMessage({
            action = "showUI"
        })
        SetNuiFocus(true, true)

        -- Create camera prop
        CreateCameraProp()

        display = true
    else
        -- UI already loaded, just show it
        SendNUIMessage({
            action = "showUI"
        })
        SetNuiFocus(true, true)

        -- Create camera prop
        CreateCameraProp()

        display = true
    end
end

-- Close the screenshot UI
function CloseScreenshotUI()
    SendNUIMessage({
        action = "hideUI"
    })
    SetNuiFocus(false, false)
    display = false

    -- Remove camera prop
    DeleteCameraProp()
end

-- Create camera prop attached to player
function CreateCameraProp()
    -- Delete if already exists
    DeleteCameraProp()

    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    local boneIndex = GetPedBoneIndex(playerPed, 28422) -- Right hand bone

    -- Load camera model
    local cameraModel = "prop_pap_camera_01"
    RequestModel(cameraModel)
    while not HasModelLoaded(cameraModel) do
        Wait(10)
    end

    -- Create camera prop in player's hand
    cameraProp = CreateObject(cameraModel, coords.x, coords.y, coords.z, true, true, true)
    AttachEntityToEntity(cameraProp, playerPed, boneIndex, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, true, true, false, true, 1,
        true)
    SetModelAsNoLongerNeeded(cameraModel)

    -- Play camera animation
    PlayCameraAnim()
end

-- Delete camera prop
function DeleteCameraProp()
    if cameraProp and DoesEntityExist(cameraProp) then
        DeleteEntity(cameraProp)
        cameraProp = nil
    end
end

-- Play camera animation
function PlayCameraAnim()
    local playerPed = PlayerPedId()

    -- Load animation dictionary
    local animDict = "cellphone@"
    RequestAnimDict(animDict)
    while not HasAnimDictLoaded(animDict) do
        Wait(10)
    end

    -- Play animation
    TaskPlayAnim(playerPed, animDict, "cellphone_photo_idle", 2.0, 2.0, -1, 51, 0, false, false, false)
end

-- Play camera snapshot sound
function PlayCameraSound()
    PlaySoundFrontend(-1, "Camera_Shoot", "Phone_Soundset_Franklin", 1)
end

-- Apply filter to the screenshot
function ApplyFilter(screenshotData, filterName)
    -- This would need server-side implementation or external resource
    -- For demonstration purposes, we'll return the original data
    -- In a real implementation, you'd process the image with the filter settings

    -- Example of how filter parameters would be used:
    local filterParams = Config.Filters[filterName] or Config.Filters.normal

    -- Return the filtered image data (in a real implementation)
    return screenshotData
end

-- Take a screenshot
function TakeScreenshot(filterName)
    -- Hide HUD for clean screenshot
    local hudWasVisible = not IsHudHidden()
    if hudWasVisible then
        DisplayHud(false)
        DisplayRadar(false)
    end

    -- Small delay to ensure HUD is hidden
    Wait(100)

    -- Take screenshot using FiveM's function
    exports['screenshot-basic']:requestScreenshotUpload(
        "https://discord.com/api/webhooks/1351977911879729392/YvkOxvD7raqCwc_yroVgA5Vo3eljvOdrJMGoKZUHP8NWCFxazfHQHQAt-cM0CA8aBASD",
        "files[]", function(data)
            -- Debug logging
            print("Screenshot Response Data:", data)

            -- Parse the response to get the screenshot URL
            local success, resp = pcall(function()
                return json.decode(data)
            end)

            if not success then
                print("Failed to parse screenshot response:", resp)
                ShowNotification("Failed to process screenshot")
                return
            end

            -- Debug logging
            print("Parsed Response:", json.encode(resp))

            -- Try different possible response formats
            local screenshotUrl = nil
            if resp.url then
                screenshotUrl = resp.url
            elseif resp.files and resp.files[1] then
                screenshotUrl = resp.files[1]
            elseif resp.attachments and resp.attachments[1] then
                screenshotUrl = resp.attachments[1].url
            end

            if screenshotUrl then
                print("Screenshot URL:", screenshotUrl)
                -- Apply filter (this would need proper implementation)
                local filteredUrl = ApplyFilter(screenshotUrl, filterName)

                -- Show preview in UI
                SendNUIMessage({
                    action = "showPreview",
                    imageData = filteredUrl
                })

                -- Restore HUD if it was visible
                if hudWasVisible then
                    DisplayHud(true)
                    DisplayRadar(true)
                end
            else
                print("Failed to get screenshot URL from response. Response structure:", json.encode(resp))
                ShowNotification("Failed to get screenshot URL")
            end
        end)
end

-- Save the screenshot to the server
function SaveScreenshot(imageData, filterName)
    -- This would typically involve sending the data to the server
    -- For example:
    TriggerServerEvent('screenshot:save', imageData, filterName)

    -- Show notification
    ShowNotification("Screenshot saved!")
end

-- Share screenshot (social club, discord, etc)
function ShareScreenshot(imageData)
    -- Example implementation - this would need to be expanded based on your needs
    TriggerServerEvent('screenshot:share', imageData)

    -- Show notification
    ShowNotification("Screenshot shared to Discord")
end

-- Show notification
function ShowNotification(message)
    -- Use FiveM native notification
    BeginTextCommandThefeedPost("STRING")
    AddTextComponentSubstringPlayerName(message)
    EndTextCommandThefeedPostTicker(true, true)

    -- Also send to UI for a prettier notification
    SendNUIMessage({
        action = "showNotification",
        message = message
    })
end

-- NUI Callbacks
RegisterNUICallback('uiReady', function(data, cb)
    uiReady = true
    cb({
        success = true
    })
end)

RegisterNUICallback('closeUI', function(data, cb)
    CloseScreenshotUI()
    cb({
        success = true
    })
end)

RegisterNUICallback('takeScreenshot', function(data, cb)
    local filter = data.filter or "normal"
    TakeScreenshot(filter)
    PlayCameraSound()
    cb({
        success = true
    })
end)

RegisterNUICallback('playCameraSound', function(data, cb)
    PlayCameraSound()
    cb({
        success = true
    })
end)

RegisterNUICallback('saveScreenshot', function(data, cb)
    SaveScreenshot(data.imageData, data.filter)
    cb({
        success = true
    })
end)

RegisterNUICallback('shareScreenshot', function(data, cb)
    ShareScreenshot(data.imageData)
    cb({
        success = true
    })
end)

RegisterNUICallback('previewFilter', function(data, cb)
    -- In a complete implementation, this would apply the filter in real-time
    -- For now, we'll just acknowledge the request
    cb({
        success = true
    })
end)

-- Clean up on resource stop
AddEventHandler('onResourceStop', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end

    if display then
        CloseScreenshotUI()
    end

    DeleteCameraProp()
end)
-----------------------------------

-- Function to start the phone camera
function StartPhoneCamera()
    if cameraActive then
        return
    end

    local playerPed = PlayerPedId()
    local playerCoords = GetEntityCoords(playerPed)
    local playerRotation = GetEntityRotation(playerPed)

    -- Camera create karo
    phoneCamera = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
    SetCamCoord(phoneCamera, playerCoords.x, playerCoords.y, playerCoords.z + 0.6)
    SetCamRot(phoneCamera, playerRotation.x, playerRotation.y, playerRotation.z, 2)
    RenderScriptCams(true, false, 0, true, true)

    -- Camera active flag set karo
    cameraActive = true

    -- Send event to UI (frontend)
    SendNUIMessage({
        type = "showCamera",
        show = true
    })
end

-- Function to stop the phone camera
function StopPhoneCamera()
    if not cameraActive then
        return
    end

    -- Camera destroy karo
    RenderScriptCams(false, false, 0, true, true)
    DestroyCam(phoneCamera, false)
    phoneCamera = nil
    cameraActive = false

    -- Hide camera UI
    SendNUIMessage({
        type = "showCamera",
        show = false
    })
end

-------------------appplications
RegisterNUICallback("maps", function(data)
    print(json.encode(data))

end)
RegisterNUICallback("music", function(data)
    print(json.encode(data))

end)
RegisterNUICallback("safari", function(data)
    print(json.encode(data))

end)
-------------------appplications

----------------save data-----------------------------------------------
local contacts = {}

RegisterNetEvent("userSavedNotify")
AddEventHandler("userSavedNotify", function()
    print("✅ Your data has been saved successfully!")
end)

RegisterNetEvent("receiveContacts")
AddEventHandler("receiveContacts", function(users)
    contacts = users
    ShowContactsUI() -- Function to show contacts list
end)

Citizen.CreateThread(function()
    Wait(5000) -- Wait for proper player loading
    local playerName = GetPlayerName(PlayerId())
    local citizenId = GetPlayerServerId(PlayerId())

    TriggerServerEvent("saveUserData", playerName, tostring(citizenId))
    TriggerServerEvent("requestContacts") -- Request contacts after saving user data
end)

RegisterCommand("contacts", function()
    TriggerServerEvent("requestContacts")
end, false)

function ShowContactsUI()
    SendNUIMessage({
        action = "showContact",
        user_data = contacts
    })
end

-- Register NUI callback for saving contacts
RegisterNUICallback('saveContact', function(data, cb)
    local phoneNumber = data.phoneNumber
    local contactName = data.contactName

    if phoneNumber and contactName then
        TriggerServerEvent('saveNewContact', contactName, phoneNumber)
        cb({
            success = true
        })
    else
        cb({
            success = false
        })
    end
end)

-- Register NUI callback for checking phone numbers
RegisterNUICallback('checkPhoneNumber', function(data, cb)
    local phoneNumber = data.phoneNumber

    if phoneNumber then
        TriggerServerEvent('checkPhoneNumber', phoneNumber)
        cb({
            success = true
        })
    else
        cb({
            success = false
        })
    end
end)

-- Event for receiving phone number check results
RegisterNetEvent("phoneNumberResult")
AddEventHandler("phoneNumberResult", function(exists, contactData)
    SendNUIMessage({
        action = "phoneNumberResult",
        exists = exists,
        contactData = contactData
    })
end)

-- Event for phone notifications
RegisterNetEvent("phoneNotification")
AddEventHandler("phoneNotification", function(message)
    SendNUIMessage({
        action = "phoneNotification",
        message = message
    })
end)

----------------save data-----------------------------------------------

---------------------------Messages--------------------------------------------
local chatHistory = {} -- This stores chat history for each user
local currentChatUser = nil -- This stores the current chat user

-- Send message command
-- Add this to your client.lua
RegisterNUICallback('sendMessage', function(data, cb)
    local sender = GetPlayerName(PlayerId())
    local receiver = data.receiver
    local message = data.message

    if receiver and message ~= "" then
        -- This will trigger your server-side event handler
        TriggerServerEvent('qb-core:phone:sendMessage', {
            sender = sender,
            receiver = receiver,
            message = message
        })
    else
        print("❌ Missing receiver or empty message!")
    end

    cb({
        status = "success"
    })
end)

RegisterNetEvent("qb-core:phone:messageSent")
AddEventHandler("qb-core:phone:messageSent", function(data)

    TriggerServerEvent("qb-core:phone:getMessages", data[1])
end)
RegisterNUICallback('getMessages', function(data, cb)
    local receiver = data.receiver
    if receiver then
        TriggerServerEvent('qb-core:phone:getMessages', {
            receiver = receiver
        })
    else
        print("❌ Missing receiver or empty message!")
    end

    cb({
        status = "success"
    })
end)

-- RegisterNUICallback('sendmsg', function(data, cb)
--     -- Print the received data
--     print('Message sent to: ' .. data.receiver)
--     print('Message content: ' .. data.message)

--     -- You can also log with different levels if needed
--     Citizen.Trace('Message details - To: ' .. data.receiver .. ', Content: ' .. data.message)

--     -- You might want to trigger a server event here to actually send the message
--     TriggerServerEvent('phone:sendMessage', data.receiver, data.message)

--     -- Send response back to the NUI
--     cb({
--         status = "success"
--     })
-- end)
-- Show received messages
-- client.lua
RegisterNetEvent('qb-core:phone:receiveMessages')
AddEventHandler('qb-core:phone:receiveMessages', function(messages)
    local name = GetPlayerName(PlayerId())
    SendNUIMessage({
        type = 'receiveMessages',
        messages = messages,
        name = name
    })
end)

RegisterNUICallback("loadChat", function(data, cb)
    currentChatUser = data.username
    TriggerServerEvent('qb-core:phone:getMessages', GetPlayerName(PlayerId()))
    cb({}) -- Return the response
end)

------------------------------gc

-- RegisterNetEvent('groupMem')
-- AddEventHandler('groupMem', function(data)
--     -- Print the group details on the server console
--     print("Group Name: " .. data.name)
--     print("Members: " .. table.concat(data.members, ", "))

--     -- Show the group details in the chat
--     TriggerEvent("chat:addMessage", { args = {"Group Name: " .. data.name, "Members: " .. table.concat(data.members, ", ")}})
-- end)

RegisterNUICallback('group:display', function(data, cb)
    -- Process the data
    TriggerServerEvent("group:create", data)

    -- Send a response back to the client
    cb({
        success = true
    })
end)
------------------------------gc

---------------------------gc arahy hain main.lua ki file se
RegisterNetEvent("group:receiveGroupList")
AddEventHandler("group:receiveGroupList", function(groups)
    -- Trigger NUI event to send data to JavaScript
    SendNUIMessage({
        action = "displayGroups",
        groups = groups
    })
end)

-- Requesting the group list from the server
RegisterNUICallback("groups:requestBserver", function()
    TriggerServerEvent("group:getList")
end)

RegisterNetEvent("group:receiveGroupMembers")
AddEventHandler("group:receiveGroupMembers", function(members)
    SendNUIMessage({
        action = "displayMembers",
        members = members
    })
end)
RegisterNUICallback('getGroupMembers', function(data, cb)
    -- Process the data
    TriggerServerEvent("getGroupMembers", data)

    -- Send a response back to the client
    cb({
        success = true
    })
end)

RegisterNUICallback('sendGroupMessage', function(data, cb)
    -- Process the data
    local playerData = {
        groupId = data.groupId,
        message = data.message

    }

    TriggerServerEvent("group:sendMessage", data)

    -- Send a response back to the client
    cb({
        success = true
    })
end)

RegisterNUICallback("getGroupMessages", function(data, cb)
    TriggerServerEvent("group:getMessages", data.groupId)
    cb("ok")
end)
RegisterNetEvent("group:loadMessages")
AddEventHandler("group:loadMessages", function(data)
    SendNUIMessage({
        action = "loadGroupMessages",
        messages = data.messages
    })
end)
---------------------------gc arahy hain main.lua ki file se

--------------------------add member
RegisterNUICallback("groupAddMembers", function(data, cb)
    -- Send the data to the server to add the member
    TriggerServerEvent("group:addMember", data)
    cb({
        success = true
    })
end)

-- Add NUI callback for removing members
RegisterNUICallback("group:removeMember", function(data, cb)
    if not data.groupId or not data.username then
        cb({
            success = false,
            message = "Missing group ID or username"
        })
        return
    end

    -- Trigger server event to remove member
    TriggerServerEvent("group:removeMember", {
        groupId = data.groupId,
        username = data.username
    })

    cb({
        success = true
    })
end)

-- Register event to handle member removal response
RegisterNetEvent("group:memberRemoved")
AddEventHandler("group:memberRemoved", function(success, message)
    if success then
        -- Refresh the group members list
        TriggerServerEvent("getGroupMembers", {
            groupId = currentGroupId
        })
    end

    -- Send message to UI to show notification
    SendNUIMessage({
        action = "showNotification",
        message = message
    })
end)
--------------------------add member

RegisterNUICallback("registerUser", function(data, cb)
    TriggerServerEvent("insta:registerUser", data)
    cb({})
end)

RegisterNUICallback("loginUser", function(data, cb)
    TriggerServerEvent("insta:loginUser", data)
    cb({})
end)
RegisterNetEvent("instagram:loginSuccess")
AddEventHandler("instagram:loginSuccess", function(username)
    -- NUI focus off and show main app
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = "showInstagram",
        id = username.id,
        username = username.username,
        password = username.password,
        email = username.email
    })
end)
RegisterNetEvent("instagram:loginFailed")
AddEventHandler("instagram:loginFailed", function(message)
    SendNUIMessage({
        type = "instagram:loginFailed",
        message = message
    })
end)

RegisterNUICallback("uploadPost", function(data, cb)
    local playerName = GetPlayerName(PlayerId()) -- ya stored username
    TriggerServerEvent("insta:uploadPost", {
        username = data.username,
        caption = data.caption,
        image = data.image
    })
    cb("ok")
end)

RegisterNetEvent("insta:loadPosts")
AddEventHandler("insta:loadPosts", function(posts)
    SendNUIMessage({
        type = "showPosts",
        insta_posts = posts
    })
end)
RegisterNUICallback("getUserUploadPost", function(data)
    TriggerServerEvent("insta:getMyPosts", data)
end)

RegisterNetEvent("insta:postFetched")
AddEventHandler("insta:postFetched", function(data)
    SendNUIMessage({
        type = "ownPostFetched",
        ownPosts = data
    })
end)
Citizen.CreateThread(function()
    Citizen.Wait(50)
    TriggerServerEvent("insta:getAllPosts")
    TriggerServerEvent("qb-core:phone:getMessages")
    TriggerServerEvent("insta:getComments")
end)
-- Optionally call on start

RegisterNUICallback("likePost", function(data, cb)
    TriggerServerEvent("insta:likePost", {
        postId = data.postID,
        username = data.username
    })
    cb("ok")
end)
RegisterNUICallback("addComment", function(data, cb)
    TriggerServerEvent("insta:addComment", {
        post_id = data.postId,
        comment = data.comment,
        username = data.username
    })
    cb("ok")
end)

RegisterNUICallback("viewComment", function(data, cb)
    TriggerServerEvent("insta:getComments", {
        postId = data.postId
    })
    cb("ok")
end)
RegisterNUICallback("getAllInstagramUserDetails", function(data, cb)
    TriggerServerEvent("insta:GetAllUsersInfo", data)
    cb("ok")
end)
RegisterNetEvent("instagram:loadInstaAllUsers", function(users)
    SendNUIMessage({
        type = "loadInstaAllUsers",
        users = users
    })
end)

RegisterNetEvent("insta:sendComments", function(postId, comments)

    SendNUIMessage({
        type = "sendComments",
        comments = comments
    })
end)
-----------instagram---------------
-- stories
RegisterNUICallback("uploadStory", function(data, cb)
    TriggerServerEvent("insta:uploadStory", {
        image = data.image,
        username = data.username
    })
    cb({})
end)

RegisterNUICallback("getStories", function(_, cb)
    TriggerServerEvent("insta:getStories")
    cb({})
end)

RegisterNetEvent("insta:loadStories")
AddEventHandler("insta:loadStories", function(stories)
    username = GetPlayerName(PlayerId())
    SendNUIMessage({
        type = "loadStories",
        stories = stories.stories
    })
end)

-- stories

---get all users
RegisterNUICallback("getAllUsers", function(data, cb)
    TriggerServerEvent("insta:AllUsersGet", data)
    cb({})
end)
RegisterNUICallback("renderPost", function(_, cb)
    TriggerServerEvent("insta:getAllPosts") -- 🔁 server se fresh posts
    cb({})
end)
RegisterNetEvent("instagram:loadAllUsers")
AddEventHandler("instagram:loadAllUsers", function(users)
    SendNUIMessage({
        type = "instagramUsers",
        users = users
    })
end)
---get all users

----follower    
RegisterNUICallback("followUser", function(data, cb)
    TriggerServerEvent("insta:followUser", {
        followerId = data.followerId,
        followingId = data.followingId
    })
    cb({})
end)
RegisterNUICallback("unfollowUser", function(data, cb)
    TriggerServerEvent("insta:unfollowUser", {
        followerId = data.followerId,
        followingId = data.followingId
    })
    cb({})
end)
RegisterNUICallback("getFollowData", function(data, cb)
    TriggerServerEvent("instagram:getFollowerData", data)
    cb({})
end)

-- Trigger karna data mangwane ke liye

-- Data receive karna
RegisterNetEvent("instagram:receiveFollowerData")
AddEventHandler("instagram:receiveFollowerData", function(followersCount, followingCount)
    -- NUI ko bhejna

    SendNUIMessage({
        type = "updateFollowStats",
        followers = followersCount,
        following = followingCount
    })
end)

----follower    
---update profile
RegisterNUICallback("updateProfile", function(data, cb)
    TriggerServerEvent("insta:updateProfile", data)
    cb({})
end)
---update profile

-----------instagram---------------

-------------------pma

RegisterNUICallback('startCall', function(data, cb)
    TriggerServerEvent('phone:call', data.phoneNumber)
    cb({})
end)
RegisterNetEvent('phone:playerOffline')
AddEventHandler('phone:playerOffline', function()

    SendNUIMessage({
        action = "playerOffline"
    })
end)

RegisterNetEvent('phone:incomingCall', function(callerNumber)
    SetNuiFocus(true, true)
    SendNUIMessage({
        type = "incomingCall",
        number = callerNumber
    })
end)

RegisterNUICallback("acceptCall", function(data, cb)
    local src = source
    local phoneNumber = data.number
    exports['pma-voice']:setCallChannel(1)
    SendNUIMessage({
        type = "hideCallUI"
    })
    cb({})
end)

RegisterNUICallback("rejectCall", function(data, cb)
    local src = source
    print("📴 Call Rejected by:", src)

    exports['pma-voice']:setCallChannel(0) -- leave voice channel
    SendNUIMessage({
        type = "hideCallUI"
    })

    cb({})
end)
RegisterNUICallback("endCall", function(data, cb)
    local src = source

    exports['pma-voice']:setCallChannel(0)
    TriggerServerEvent("phone:callEnded", data)
    cb({})
end)

RegisterNUICallback("phone:getContacts", function(data, cb)
    TriggerServerEvent("phone:getContactInfo")
end)

RegisterNetEvent("phone:sendContactInfo", function(contacts)
    SendNUIMessage({
        action = "showRecentContacts",
        contacts = contacts
    })
end)
-------------------pma

-----------------my details
RegisterNUICallback("Client:MyDetails", function(_, cb)
    TriggerServerEvent("user:MyDetails")
    TriggerServerEvent("user:GetMyDetailsFromDB")
    cb({})
end)
RegisterNetEvent("user:ReceiveMyDetails")
AddEventHandler("user:ReceiveMyDetails", function(data)
    SendNUIMessage({
        type = "ReceiveMyDetails",
        data = data
    })
end)
RegisterNetEvent("phone:SerialAndPhone")
AddEventHandler("phone:SerialAndPhone", function(data)
    SendNUIMessage({
        type = "Mob-info",
        data = data
    })
end)
-----------------my details

-----youtube videos
RegisterNUICallback("sendYoutubeVideo", function(data)
    TriggerServerEvent("youtube:saveVideo", data)
end)
RegisterNUICallback("youtube:search", function(data)

    TriggerServerEvent("youtube:searchVideos", data)
end)
RegisterNetEvent("youtube:searchResults")
AddEventHandler("youtube:searchResults", function(data)
    SendNUIMessage({
        type = "YoutubeVideosResults",
        data = data
    })

end)
RegisterNUICallback("getMyVideo", function()
    TriggerServerEvent("youtube:getMyVideos")
end)

RegisterNetEvent("youtube:resultsMyVideos")
AddEventHandler("youtube:resultsMyVideos", function(data)
    SendNUIMessage({
        type = "myYoutubeVideosResults",
        data = data
    })

end)
RegisterNUICallback("deleteVideo", function(data, cb)
    local videoId = data.videoId
    TriggerServerEvent("youtube:deleteMyVideos", videoId)
    cb({
        success = true
    })
end)
RegisterNUICallback("updateAvatar", function(data, cb)
    TriggerServerEvent("user:UpdateAvatar", data)
    cb({
        success = true
    })
end)

-----youtube videos

-----facebook
RegisterNUICallback("facebookLogin", function(data, cb)
    TriggerServerEvent("facebook:login", data)
    cb({})
end)
RegisterNUICallback("facebookSignup", function(data, cb)
    TriggerServerEvent("facebook:signup", data)
    cb({})
end)
RegisterNetEvent("facebook:signupResult")
AddEventHandler("facebook:signupResult", function(message)
    SendNUIMessage({
        type = "facebookSignupResult",
        message = message
    })
end)
RegisterNetEvent("facebook:loginResult")
AddEventHandler("facebook:loginResult", function(message, userId, status)
    SendNUIMessage({
        type = "facebookLoginResult",
        message = message,
        userId = userId,
        status = status
    })
end)
RegisterNUICallback("facebookGetUserDetails", function(data, cb)
    TriggerServerEvent("facebook:getUserDetails", data)
    cb({})
end)

RegisterNetEvent("facebook:getUserDetailsResult")
AddEventHandler("facebook:getUserDetailsResult", function(data)
    SendNUIMessage({
        type = "facebookUserDetails",
        data = data
    })
end)

RegisterNUICallback("uploadPfpFb", function(data, cb)
    TriggerServerEvent("facebook:uploadpfpImage", data)
    TriggerServerEvent("facebook:getUserDetails", data.id)
    cb({})
end)
RegisterNUICallback("uploadTxtContent", function(data, cb)
    TriggerServerEvent("facebook:UploadTextContent", data)
    cb({})
end)
RegisterNUICallback("fetchingFbPosts", function(data, cb)
    TriggerServerEvent("facebook:FetchAllFacebookPost", data)
    cb({})
end)

RegisterNetEvent("facebook:postsFetched")
AddEventHandler("facebook:postsFetched", function(data)
    SendNUIMessage({
        type = "facebookposts",
        posts = data
    })
end)
-- Client-side callbacks
RegisterNUICallback("facebook_likes", function(data, cb)
    TriggerServerEvent("facebook:postLike", data)
    cb('ok')
end)

RegisterNUICallback("facebook_comments", function(data, cb)
    TriggerServerEvent("facebook:comments", data)
    cb('ok')
end)

RegisterNUICallback("fb_fetch_comments", function(data, cb)
    TriggerServerEvent("facebook:fetch_comments", data.postId, function(comments)
        SendNUIMessage({
            type = "facebookcomments",
            postId = data.postId,
            comments = comments
        })
    end)
    cb('ok')
end)

-- Register event handler to receive comments from server
RegisterNetEvent("facebook:receiveComments")
AddEventHandler("facebook:receiveComments", function(postId, comments)
    SendNUIMessage({
        type = "facebookcomments",
        postId = postId,
        comments = comments
    })
end)
RegisterNUICallback("facebook_users_fetch", function(data)
    TriggerServerEvent("facebook:GetAllUsers", data)
end)
RegisterNetEvent("facebook:ReceiveAllUsers")
AddEventHandler("facebook:ReceiveAllUsers", function(data)
    SendNUIMessage({
        type = "AllUserRecieved",
        users = data
    })
end)

RegisterNUICallback("SendFbRequest", function(data)
    print(json.encode(data))
    TriggerServerEvent("facebook:SendFriendRequest", data.senderId, data.recieverId)
end)
RegisterNUICallback("FetchIncomingRequests", function(data, cb)
    TriggerServerEvent("facebook:GetIncomingRequests", data)
end)

RegisterNetEvent("facebook:ReceiveIncomingRequests")
AddEventHandler("facebook:ReceiveIncomingRequests", function(requestArray)
    SendNUIMessage({
        type = "IncomingRequestsReceived",
        requests = requestArray
    });

end)

RegisterNUICallback("handleFacebookRequest", function(data)
    TriggerServerEvent("facebook:HandleFriendRequest", data)
end)
-----facebook

-----tiktok
RegisterNUICallback("tiktokSignUp", function(data, cb)
    TriggerServerEvent("tiktok:registerUser", data)
    cb({
        status = "ok",
        message = "Signup received!"
    })
end)
RegisterNUICallback("tiktokLogin", function(data, cb)
    TriggerServerEvent("tiktok:loginUser", data)
    cb({
        status = "ok",
        message = "Signup received!"
    })
end)

RegisterNetEvent("tiktok:signupAlert")
AddEventHandler("tiktok:signupAlert", function(data)
    SendNUIMessage({
        type = "TiktokSignUp",
        message = data
    })
end)

RegisterNetEvent("tiktok:loginAlert")
AddEventHandler("tiktok:loginAlert", function(data)
    SendNUIMessage({
        type = "TiktokLogin",
        status = data.status,
        message = data.message,
        userId = data.userId or nil
    })
end)
RegisterNUICallback("GetTiktokUserDetails", function(data)
    TriggerServerEvent("tiktok:GetUserDetail", data)
end)
RegisterNetEvent("tiktok:TiktokerData")
AddEventHandler("tiktok:TiktokerData", function(data)
    SendNUIMessage({
        type = "TiktokerDetail",
        data = data
    })
end)

RegisterNUICallback("uploadTiktokVideo", function(data)
    TriggerServerEvent("tiktok:uploadVideo", data)
end)


RegisterNUICallback("getTiktokVideos",function()
    TriggerServerEvent("tiktok:getAllVideos")
end)

RegisterNetEvent("tiktok:receiveVideos")
AddEventHandler("tiktok:receiveVideos", function(videos)
    SendNUIMessage({
        type = "TiktokFeedVideos",
        data = videos
    })
end)
RegisterNetEvent("tiktok:profileUpdated")
AddEventHandler("tiktok:profileUpdated", function(message)
    SendNUIMessage({
        type = "TiktokProfileUpdate",
        message = message
    })
end)

RegisterNUICallback("uploadProfiletiktok",function(data)
    TriggerServerEvent("tiktok:updateTiktokProfile",data)
end)

-----tiktok
