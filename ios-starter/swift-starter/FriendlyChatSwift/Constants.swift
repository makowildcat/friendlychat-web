//
//  Copyright (c) 2015 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//

struct Constants {
  struct GCMStrings {
    static let Topic = "/topics/global"
  }

  struct NotificationKeys {
    static let SignedIn = "onSignInCompleted"
    static let Registration = "onRegistrationCompleted"
    static let Message = "onMessageReceived"
  }

  struct Segues {
    static let SignInToFp = "SignInToFP"
    static let FpToSignIn = "FPToSignIn"
  }

  struct MessageFields {
    static let name = "name"
    static let text = "text"
    static let photoUrl = "photoUrl"
  }
}