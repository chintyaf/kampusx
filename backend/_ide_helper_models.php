<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Event> $events
 * @property-read int|null $events_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Category whereName($value)
 */
	class Category extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $organizer_id
 * @property string|null $slug
 * @property string|null $title
 * @property string|null $description
 * @property string|null $location_type
 * @property string|null $start_date
 * @property string|null $end_date
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category> $categories
 * @property-read int|null $categories_count
 * @property-read \App\Models\User $organizer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\EventSession> $sessions
 * @property-read int|null $sessions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereLocationType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereOrganizerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Event whereUpdatedAt($value)
 */
	class Event extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $event_id
 * @property string $type
 * @property string|null $venue_name
 * @property string|null $room_name
 * @property string|null $floor
 * @property string|null $room_code
 * @property int|null $capacity_range
 * @property string|null $maps_url
 * @property string|null $access_instruction
 * @property int|null $offline_quota
 * @property string|null $meeting_link
 * @property string|null $notes
 * @property int|null $online_quota
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Event $event
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereAccessInstruction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereCapacityRange($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereEventId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereFloor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereMapsUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereMeetingLink($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereOfflineQuota($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereOnlineQuota($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereRoomCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereRoomName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventLocation whereVenueName($value)
 */
	class EventLocation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $event_id
 * @property string $title
 * @property string|null $description
 * @property string $date
 * @property string $start_time
 * @property string $end_time
 * @property string|null $location
 * @property int|null $quota
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Event $event
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Speaker> $speakers
 * @property-read int|null $speakers_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereEndTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereEventId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereLocation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereQuota($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereStartTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EventSession whereUpdatedAt($value)
 */
	class EventSession extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $event_session_id
 * @property string $name
 * @property string|null $role
 * @property string|null $bio
 * @property string|null $linkedin
 * @property string|null $expertise
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\EventSession> $sessions
 * @property-read int|null $sessions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Speaker newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Speaker newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Speaker query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Speaker whereBio($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Speaker whereEventSessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Speaker whereExpertise($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Speaker whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Speaker whereLinkedin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Speaker whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Speaker whereRole($value)
 */
	class Speaker extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string $password
 * @property string $role
 * @property string $status
 * @property bool $is_verified
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Event> $events
 * @property-read int|null $events_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsVerified($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

