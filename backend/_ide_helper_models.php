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
 * @property string $slug
 * @property string $title
 * @property string|null $description
 * @property string $location_type
 * @property string $start_date
 * @property string $end_date
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $organizer
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
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
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
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

