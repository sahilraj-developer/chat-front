# Test Cases & Use Cases for WhatsChat

## Use Cases
1. **User Authentication**
   - **UC1**: User can register with email and password.
   - **UC2**: User can log in with valid credentials.
   - **UC3**: User can request a password reset via email.
2. **Profile & Social**
   - **UC4**: User can update their profile picture, bio, and name.
   - **UC5**: User can toggle their account privacy (Public vs. Private).
   - **UC6**: User can follow other users (or request to follow if private).
   - **UC7**: User can block and unblock other users.
3. **Messaging**
   - **UC8**: User can send direct messages to another user.
   - **UC9**: User can send messages with images or video attachments.
   - **UC10**: User receives real-time updates when receiving a message.
4. **Groups & Communities**
   - **UC11**: User can create a group and invite members.
   - **UC12**: User can send messages to a group or community.

## Test Cases

### Test Suite: Authentication
- **TC-AUTH-01**: Submit signup form with valid data. Expected: Account created, token received.
- **TC-AUTH-02**: Submit signup form with existing email. Expected: Error message "Account already exists".
- **TC-AUTH-03**: Submit login form with valid credentials. Expected: Successful login, token received.

### Test Suite: Social
- **TC-SOC-01**: Block a user. Expected: User is added to blocked list, follow relationship is destroyed, unable to send messages.
- **TC-SOC-02**: Unblock a user. Expected: User removed from blocked list.
- **TC-SOC-03**: Send follow request to a private account. Expected: Request status becomes "pending".
- **TC-SOC-04**: Accept follow request. Expected: Status becomes "accepted", follower count increments.

### Test Suite: Messaging
- **TC-MSG-01**: Send text message. Expected: Message saved, receiver gets socket event.
- **TC-MSG-02**: Send message to blocked user. Expected: API returns error "You cannot send messages to this user".
- **TC-MSG-03**: Check unseen message count. Expected: Sidebar shows correct number of unseen messages.

## API Versioning & Documentation
- V1 endpoints are accessible at `/api/v1/`.
- Swagger documentation is available at `/api-docs`.
