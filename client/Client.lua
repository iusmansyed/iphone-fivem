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

    print("🔹 Player spawned: " .. playerName)
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
RegisterNUICallback('getMessages', function(data, cb)
    print(json.encode(data))
    local sender = data.receiver

    if sender then
        -- This will trigger your server-side event handler
        TriggerServerEvent('qb-core:phone:getMessages', {
            sender = json.encode(sender),
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
    -- Debugging: Print the messages received from the server
    print("Received messages: " .. json.encode(messages))

    -- You can now send this data to JavaScript via an exported function, if required
    -- Example: Using the NUI (HTML/JS) interface to pass the data
    SendNUIMessage({
        type = 'receiveMessages', -- A custom message type to handle on the JS side
        messages = messages
    })
end)

-- View messages for current user
RegisterCommand("viewMessages", function()
    if currentChatUser and chatHistory[currentChatUser] then
        for _, msg in ipairs(chatHistory[currentChatUser]) do
            print(msg.sender .. ": " .. msg.message)
        end
    else
        print("📭 No messages with this user yet.")
    end
end)

-- NUI callback to load messages
RegisterNUICallback("loadChat", function(data, cb)
    currentChatUser = data.username
    TriggerServerEvent('qb-core:phone:getMessages', GetPlayerName(PlayerId()))
    cb({}) -- Return the response
end)
