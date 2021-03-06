local server = "localhost:8080"
local fetchPath = "http://"..server.."/fetch"
local registerPath = "http://"..server.."/register"
args = {...}
local script = args[1]
if script == nil or script == "" then
   script = "test.lua"
end
local label = os.getComputerLabel()
if ( label == nil or label == "" ) then
    label = "general"
end

math.randomseed( os.time() )

function poll()
   local scriptID = label .. "-" .. script
   local fetched = http.get(fetchPath .. "/" .. identity .. "/" .. scriptID)
   local data = fetched.readAll()
    if data == nil or data == '' then
    else
        print "Got a program:"
        print "--------------------------"
        local func = loadstring(data)
        print(data)
        print "--------------------------"
        local result, err = pcall(func)
        print("Was successful: ")
        print(result)
        print("")
    end
end

local random = math.random
local function uuid()
    local template ='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return string.gsub(template, '[xy]', function (c)
        local v = (c == 'x') and random(0, 0xf) or random(8, 0xb)
        return string.format('%x', v)
    end)
end

local function writeUuid()
    local file = fs.open("uuid.txt", "w")
    local thisUuid = uuid()
    print("Writing uuid " .. thisUuid .. " to disk.")
    file.write(thisUuid)
    file.close()
    return thisUuid
end

local function readUuid()
    local file = fs.open("uuid.txt", "r")
    local lineAll = file.readAll()
    file.close()
    return lineAll
end

function uuidExists()
    return fs.exists("uuid.txt")
end

function sleep(seconds)
    os.sleep(seconds)
    -- os.execute("sleep " .. seconds)
end

print("---------------------------")
print("Remote Executor version 1.1")
print("---------------------------")

if not uuidExists() then
    identity = writeUuid()
else
    identity = readUuid()
end

print("Registering @ " .. registerPath)
http.get(registerPath .. "/" .. identity )
print("Computer " .. identity .. " is ready to execute script " .. script .. ".")

while true do
    poll()
    sleep(1)
end
