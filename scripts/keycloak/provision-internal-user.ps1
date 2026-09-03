[CmdletBinding()]
param(
    [Parameter(
        Mandatory,
        HelpMessage = 'Exact username or email of the existing target user to provision.'
    )]
    [ValidateNotNullOrEmpty()]
    [string]$Identifier,

    [Parameter(Mandatory)]
    [ValidateSet(
        'recruiter',
        'admin',
        'hr',
        'hiring-manager',
        'auditor',
        'accounts'
    )]
    [string]$InternalRole
)

$ErrorActionPreference = 'Stop'
$realmName = 'talensora'
$composeProject = 'talensora-candidate-sourcing-system'
$kcadm = '/opt/keycloak/bin/kcadm.sh'
$kcadmConfig = "/tmp/talensora-provision-$PID.config"

$groupPaths = @{
    recruiter = '/internal/recruiters'
    admin = '/internal/admins'
    hr = '/internal/hr'
    'hiring-manager' = '/internal/hiring-managers'
    auditor = '/internal/auditors'
    accounts = '/internal/accounts'
}
$approvedGroupPaths = @(
    '/external/candidates'
) + @($groupPaths.Values)

$expectedRoles = @{
    recruiter = @('RECRUITER')
    admin = @('ADMIN')
    hr = @('HR', 'RECRUITER')
    'hiring-manager' = @('HIRING_MANAGER')
    auditor = @('AUDITOR')
    accounts = @('ACCOUNTS')
}

$privilegedRoles = @(
    'RECRUITER',
    'ADMIN',
    'HR',
    'HIRING_MANAGER',
    'AUDITOR',
    'ACCOUNTS'
)

function ConvertTo-ProcessArgument {
    param(
        [AllowEmptyString()]
        [string]$Argument
    )

    if ($Argument -and $Argument -notmatch '[\s"]') {
        return $Argument
    }

    $quoted = '"'
    $backslashCount = 0

    foreach ($character in $Argument.ToCharArray()) {
        if ($character -eq '\') {
            $backslashCount++
            continue
        }

        if ($character -eq '"') {
            $quoted += ('\' * (($backslashCount * 2) + 1)) + '"'
        } else {
            $quoted += ('\' * $backslashCount) + $character
        }

        $backslashCount = 0
    }

    return $quoted + ('\' * ($backslashCount * 2)) + '"'
}

function Invoke-DockerCommand {
    param(
        [Parameter(Mandatory)]
        [string[]]$Arguments,

        [Parameter(Mandatory)]
        [string]$FailureMessage,

        [hashtable]$EnvironmentVariables = @{}
    )

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = 'docker'
    $startInfo.Arguments = (
        $Arguments |
            ForEach-Object { ConvertTo-ProcessArgument -Argument "$_" }
    ) -join ' '
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true

    foreach ($name in $EnvironmentVariables.Keys) {
        $startInfo.EnvironmentVariables[$name] = $EnvironmentVariables[$name]
    }

    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo

    if (-not $process.Start()) {
        throw "$FailureMessage Docker could not be started."
    }

    try {
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        $stdout = $stdoutTask.GetAwaiter().GetResult()
        $stderr = $stderrTask.GetAwaiter().GetResult()

        if ($process.ExitCode -ne 0) {
            $stderrStatus = if ([string]::IsNullOrWhiteSpace($stderr)) {
                'No stderr details were returned.'
            } else {
                'Stderr details were withheld to protect credentials.'
            }

            throw "$FailureMessage Exit code: $($process.ExitCode). $stderrStatus"
        }
    } finally {
        $process.Dispose()
    }

    return $stdout
}

function ConvertFrom-KeycloakJson {
    param(
        [Parameter(Mandatory)]
        [AllowEmptyString()]
        [string]$Json,

        [Parameter(Mandatory)]
        [string]$Context
    )

    if ([string]::IsNullOrWhiteSpace($Json)) {
        throw "Keycloak returned no JSON while $Context."
    }

    try {
        return $Json | ConvertFrom-Json -ErrorAction Stop
    } catch {
        throw "Keycloak returned invalid JSON while $Context."
    }
}

function Invoke-Kcadm {
    param(
        [Parameter(Mandatory)]
        [string[]]$Arguments
    )

    $dockerArguments = @(
        'exec', $keycloakContainerId,
        $kcadm
    ) + $Arguments + @(
        '--config', $kcadmConfig
    )
    $output = Invoke-DockerCommand `
        -Arguments $dockerArguments `
        -FailureMessage 'Keycloak administration command failed.'

    return $output
}

function Resolve-KeycloakGroupByPath {
    param(
        [Parameter(Mandatory)]
        [string]$GroupPath
    )

    if ($GroupPath -notin $approvedGroupPaths) {
        throw 'The requested Keycloak group path is not approved.'
    }

    # GroupPath begins with '/', intentionally producing an endpoint such as
    # group-by-path//internal/recruiters so Keycloak receives the full path.
    $groupJson = Invoke-Kcadm -Arguments @(
        'get', "group-by-path/$GroupPath",
        '-r', $realmName
    )
    $group = ConvertFrom-KeycloakJson `
        -Json $groupJson `
        -Context "resolving exact group path $GroupPath"

    if (
        [string]::IsNullOrWhiteSpace($group.id) -or
        [string]::IsNullOrWhiteSpace($group.path) -or
        $group.path -cne $GroupPath
    ) {
        throw "Keycloak did not return the exact approved group path $GroupPath."
    }

    return [pscustomobject]@{
        Id = $group.id
        Path = $group.path
    }
}

$containerOutput = Invoke-DockerCommand `
    -Arguments @(
        'ps',
        '--filter', "label=com.docker.compose.project=$composeProject",
        '--filter', 'label=com.docker.compose.service=keycloak',
        '--filter', 'status=running',
        '--format', '{{.ID}}'
    ) `
    -FailureMessage 'Unable to locate the running Talensora Keycloak container.'
$keycloakContainerIds = @(
    $containerOutput -split "`r?`n" |
        ForEach-Object { "$_".Trim() } |
        Where-Object { $_ }
)

if ($keycloakContainerIds.Count -eq 0) {
    throw 'The Talensora Keycloak container is not running.'
}

if ($keycloakContainerIds.Count -gt 1) {
    throw 'More than one running Talensora Keycloak container was found.'
}

$keycloakContainerId = $keycloakContainerIds[0]
$adminUsername = $env:TALENSORA_KEYCLOAK_ADMIN_USERNAME
$adminPassword = $env:TALENSORA_KEYCLOAK_ADMIN_PASSWORD
$passwordPointer = [IntPtr]::Zero

if ([string]::IsNullOrWhiteSpace($adminUsername)) {
    $adminUsername = Read-Host 'Permanent Keycloak administrator username'
}

if ([string]::IsNullOrWhiteSpace($adminPassword)) {
    $securePassword = Read-Host `
        'Permanent Keycloak administrator password' `
        -AsSecureString

    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR(
        $securePassword
    )

    $adminPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
        $passwordPointer
    )
}

if (
    [string]::IsNullOrWhiteSpace($adminUsername) -or
    [string]::IsNullOrWhiteSpace($adminPassword)
) {
    throw 'Keycloak administrator credentials are required.'
}

try {
    Invoke-DockerCommand `
        -Arguments @(
            'exec',
            '-e', 'TALENSORA_KCADM_PASSWORD',
            $keycloakContainerId,
            'sh', '-c',
            '/opt/keycloak/bin/kcadm.sh config credentials --config "$1" --server http://localhost:8080 --realm master --user "$2" --password "$TALENSORA_KCADM_PASSWORD"',
            'sh', $kcadmConfig, $adminUsername
        ) `
        -EnvironmentVariables @{
            TALENSORA_KCADM_PASSWORD = $adminPassword
        } `
        -FailureMessage 'Keycloak administrator authentication failed.' |
        Out-Null

    foreach ($requiredPath in @(
        '/external/candidates',
        '/internal/recruiters',
        '/internal/admins'
    )) {
        Resolve-KeycloakGroupByPath -GroupPath $requiredPath | Out-Null
        Write-Output "FOUND $requiredPath"
    }

    $usernameJson = Invoke-Kcadm -Arguments @(
        'get', 'users',
        '-r', $realmName,
        '-q', "username=$Identifier",
        '-q', 'exact=true'
    )

    $emailJson = Invoke-Kcadm -Arguments @(
        'get', 'users',
        '-r', $realmName,
        '-q', "email=$Identifier",
        '-q', 'exact=true'
    )

    $users = @(
        @(ConvertFrom-KeycloakJson `
            -Json $usernameJson `
            -Context 'resolving user by username')
        @(ConvertFrom-KeycloakJson `
            -Json $emailJson `
            -Context 'resolving user by email')
    ) | Where-Object { $_ -and $_.id } |
        Sort-Object -Property id -Unique

    if ($users.Count -eq 0) {
        throw 'No exact Keycloak user match was found.'
    }

    if ($users.Count -gt 1) {
        throw 'More than one exact Keycloak user match was found.'
    }

    $userId = $users[0].id

    $directRolesJson = Invoke-Kcadm -Arguments @(
        'get', "users/$userId/role-mappings/realm",
        '-r', $realmName
    )
    $directRoles = ConvertFrom-KeycloakJson `
        -Json $directRolesJson `
        -Context 'checking direct role assignments'
    $directApplicationRoles = @(
        $directRoles.name |
            Where-Object {
                $_ -eq 'CANDIDATE' -or
                $_ -in $privilegedRoles
            }
    )

    if ($directApplicationRoles.Count -gt 0) {
        throw 'Direct Talensora realm-role assignments must be removed before group provisioning.'
    }

    $targetPath = $groupPaths[$InternalRole]
    $targetGroup = Resolve-KeycloakGroupByPath -GroupPath $targetPath

    $membershipsJson = Invoke-Kcadm -Arguments @(
        'get', "users/$userId/groups",
        '-r', $realmName
    )
    $memberships = @(
        ConvertFrom-KeycloakJson `
            -Json $membershipsJson `
            -Context 'checking current group memberships'
    )

    foreach ($membership in $memberships) {
        $mustRemove =
            $membership.path -eq '/external/candidates' -or
            (
                $membership.path -like '/internal/*' -and
                $membership.path -ne $targetPath
            )

        if ($mustRemove) {
            Invoke-Kcadm -Arguments @(
                'delete',
                "users/$userId/groups/$($membership.id)",
                '-r', $realmName
            ) | Out-Null
        }
    }

    $membershipsJson = Invoke-Kcadm -Arguments @(
        'get', "users/$userId/groups",
        '-r', $realmName
    )
    $memberships = @(
        ConvertFrom-KeycloakJson `
            -Json $membershipsJson `
            -Context 'checking updated group memberships'
    )

    if ($memberships.path -notcontains $targetPath) {
        Invoke-Kcadm -Arguments @(
            'update',
            "users/$userId/groups/$($targetGroup.Id)",
            '-r', $realmName,
            '-s', "realm=$realmName",
            '-s', "userId=$userId",
            '-s', "groupId=$($targetGroup.Id)",
            '-n'
        ) | Out-Null
    }

    $finalMembershipsJson = Invoke-Kcadm -Arguments @(
        'get', "users/$userId/groups",
        '-r', $realmName
    )
    $finalMemberships = @(
        ConvertFrom-KeycloakJson `
            -Json $finalMembershipsJson `
            -Context 'verifying final group memberships'
    )
    $internalPaths = @(
        $finalMemberships.path | Where-Object { $_ -like '/internal/*' }
    )

    if (
        $finalMemberships.path -contains '/external/candidates' -or
        $internalPaths.Count -ne 1 -or
        $internalPaths[0] -ne $targetPath
    ) {
        throw 'Final Keycloak group verification failed.'
    }

    $rolesJson = Invoke-Kcadm -Arguments @(
        'get', "users/$userId/role-mappings/realm/composite",
        '-r', $realmName
    )
    $roleRecords = ConvertFrom-KeycloakJson `
        -Json $rolesJson `
        -Context 'verifying final effective roles'
    $effectiveRoles = @($roleRecords.name)
    $unexpectedPrivilegedRoles = @(
        $effectiveRoles |
            Where-Object {
                $_ -in $privilegedRoles -and
                $_ -notin $expectedRoles[$InternalRole]
            }
    )
    $missingExpectedRoles = @(
        $expectedRoles[$InternalRole] |
            Where-Object { $_ -notin $effectiveRoles }
    )

    if (
        'CANDIDATE' -in $effectiveRoles -or
        $unexpectedPrivilegedRoles.Count -gt 0 -or
        $missingExpectedRoles.Count -gt 0
    ) {
        throw 'Final Keycloak effective-role verification failed.'
    }

    Write-Output "Provisioning succeeded for group $targetPath."
    Write-Output "Verified roles: $($expectedRoles[$InternalRole] -join ', ')."
    Write-Output 'The user must sign out and re-authenticate.'
} finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }

    $adminPassword = $null

    Invoke-DockerCommand `
        -Arguments @(
            'exec', $keycloakContainerId,
            '/bin/rm', '-f', $kcadmConfig
        ) `
        -FailureMessage 'Failed to remove the temporary Keycloak configuration.' |
        Out-Null
}
