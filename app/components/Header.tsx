import React from 'react';
import { IoLogOutOutline, IoLogInOutline } from 'react-icons/io5';
import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { useRouter } from 'next/router';

const menuItems = [
  {
    title: 'New Project',
    href: '/app/create',
  },
  {
    title: 'My Projects',
    href: '/app/projects',
  },
];

export default function Header() {
  const { user, error, isLoading } = useUser();
  const { asPath } = useRouter();

  return (
    <header className="mb-16 py-4 bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <a>
                <svg
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 485 88"
                  className="logo w-28 h-auto sm:w-32"
                >
                  <path
                    d="M133.346 20.533c1.12 0 2.082.378 2.888 1.134.851.755 1.277 1.666 1.277 2.733 0 .578-.135 1.178-.403 1.8l-16.591 38.533c-.403.845-.963 1.49-1.679 1.934a4.263 4.263 0 0 1-2.284.666 4.683 4.683 0 0 1-2.15-.666c-.627-.445-1.119-1.067-1.477-1.867L96.336 26.133c-.224-.444-.336-1-.336-1.666 0-1.2.448-2.156 1.343-2.867.896-.756 1.814-1.133 2.754-1.133.762 0 1.478.222 2.15.666.671.445 1.186 1.09 1.545 1.934L117.293 54.6l12.359-31.533c.358-.8.873-1.423 1.545-1.867.671-.444 1.388-.667 2.149-.667ZM156.3 63.267c0 1.155-.425 2.133-1.276 2.933-.851.756-1.836 1.133-2.956 1.133-1.209 0-2.216-.377-3.022-1.133-.761-.8-1.142-1.778-1.142-2.933V24.733c0-1.155.403-2.11 1.209-2.866.806-.8 1.836-1.2 3.09-1.2 1.119 0 2.082.4 2.888 1.2.806.755 1.209 1.71 1.209 2.866v38.534ZM189.911 20.667c4.209 0 7.814 1.044 10.814 3.133 3.045 2.044 5.351 4.844 6.918 8.4 1.613 3.511 2.419 7.444 2.419 11.8 0 4.356-.806 8.311-2.419 11.867-1.567 3.51-3.873 6.31-6.918 8.4-3 2.044-6.605 3.066-10.814 3.066h-16.054c-1.164 0-2.149-.377-2.955-1.133-.761-.8-1.142-1.778-1.142-2.933V24.733c0-1.155.381-2.11 1.142-2.866.806-.8 1.791-1.2 2.955-1.2h16.054Zm-.672 39c4.03 0 7.053-1.467 9.068-4.4 2.015-2.978 3.023-6.734 3.023-11.267 0-4.533-1.03-8.267-3.09-11.2-2.015-2.978-5.015-4.467-9.001-4.467h-11.083v31.334h11.083ZM247.733 59.667c1.164 0 2.127.4 2.888 1.2.806.755 1.209 1.644 1.209 2.666 0 1.111-.403 2.023-1.209 2.734-.761.71-1.724 1.066-2.888 1.066h-22.502c-1.164 0-2.149-.377-2.955-1.133-.761-.8-1.142-1.778-1.142-2.933V24.733c0-1.155.381-2.11 1.142-2.866.806-.8 1.791-1.2 2.955-1.2h22.502c1.164 0 2.127.377 2.888 1.133.806.711 1.209 1.644 1.209 2.8 0 1.111-.38 2.022-1.142 2.733-.761.667-1.746 1-2.955 1H229.53v11.334h15.18c1.165 0 2.127.377 2.889 1.133.806.711 1.209 1.644 1.209 2.8 0 1.111-.381 2.022-1.142 2.733-.761.667-1.747 1-2.956 1h-15.18v12.334h18.203ZM306.188 44c0 4.4-.985 8.444-2.956 12.133-1.97 3.645-4.701 6.534-8.194 8.667-3.448 2.133-7.344 3.2-11.688 3.2-4.343 0-8.261-1.067-11.754-3.2-3.448-2.133-6.157-5.022-8.128-8.667-1.925-3.689-2.888-7.733-2.888-12.133 0-4.4.963-8.422 2.888-12.067 1.971-3.689 4.68-6.6 8.128-8.733 3.493-2.133 7.411-3.2 11.754-3.2 4.344 0 8.24 1.067 11.688 3.2 3.493 2.133 6.224 5.044 8.194 8.733 1.971 3.645 2.956 7.667 2.956 12.067Zm-8.732 0c0-2.978-.605-5.667-1.814-8.067-1.209-2.444-2.888-4.377-5.037-5.8-2.15-1.422-4.568-2.133-7.255-2.133-2.731 0-5.172.711-7.321 2.133-2.105 1.378-3.761 3.29-4.971 5.734-1.164 2.444-1.746 5.155-1.746 8.133 0 2.978.582 5.689 1.746 8.133 1.21 2.445 2.866 4.378 4.971 5.8 2.149 1.378 4.59 2.067 7.321 2.067 2.687 0 5.105-.711 7.255-2.133 2.149-1.423 3.828-3.334 5.037-5.734 1.209-2.444 1.814-5.155 1.814-8.133ZM353.73 24.533c.403.311.604.667.604 1.067 0 .356-.09.644-.269.867-.268.355-.604.533-1.007.533-.179 0-.448-.089-.806-.267-4.165-2.8-8.575-4.2-13.233-4.2-3.761 0-7.231.934-10.411 2.8-3.134 1.823-5.62 4.378-7.456 7.667-1.835 3.244-2.753 6.911-2.753 11s.918 7.778 2.753 11.067c1.836 3.244 4.322 5.8 7.456 7.666 3.18 1.823 6.65 2.734 10.411 2.734 4.702 0 9.091-1.378 13.166-4.134.224-.177.492-.266.806-.266.447 0 .806.177 1.074.533.179.222.269.489.269.8 0 .444-.179.8-.537 1.067-1.747 1.244-4.008 2.31-6.784 3.2-2.732.889-5.396 1.333-7.994 1.333-4.254 0-8.172-1.044-11.754-3.133-3.582-2.09-6.426-4.956-8.531-8.6-2.104-3.69-3.157-7.778-3.157-12.267s1.053-8.556 3.157-12.2c2.105-3.689 4.949-6.578 8.531-8.667 3.582-2.089 7.5-3.133 11.754-3.133 2.687 0 5.284.4 7.792 1.2 2.553.8 4.859 1.911 6.919 3.333ZM401.225 65.533c.045.134.068.311.068.534 0 .4-.135.71-.403.933-.269.222-.605.333-1.008.333-.313 0-.604-.066-.873-.2a1.403 1.403 0 0 1-.47-.666l-5.643-13.734.068.134h-22.502l-5.441 13.6c-.224.577-.627.866-1.209.866-.403 0-.739-.11-1.007-.333a1.37 1.37 0 0 1-.403-.8c-.045-.178-.023-.4.067-.667L380.537 21.4c.135-.356.291-.578.471-.667.223-.133.492-.2.806-.2.671 0 1.119.29 1.343.867l18.068 44.133ZM391.889 50.2l-10.277-25.133L371.537 50.2h20.352ZM425.77 68c-3.314 0-6.202-.556-8.665-1.667-2.463-1.155-4.903-2.933-7.321-5.333a1.35 1.35 0 0 1-.403-1c0-.356.156-.689.47-1 .313-.356.649-.533 1.007-.533.403 0 .784.2 1.142.6 1.747 2.044 3.807 3.6 6.18 4.666a18.605 18.605 0 0 0 7.59 1.6c3.448 0 6.291-.822 8.53-2.466 2.239-1.645 3.359-3.823 3.359-6.534-.045-2.133-.627-3.889-1.747-5.266-1.119-1.378-2.507-2.467-4.164-3.267-1.612-.844-3.829-1.778-6.65-2.8-3.09-1.156-5.508-2.178-7.254-3.067-1.702-.889-3.179-2.155-4.433-3.8-1.209-1.644-1.814-3.8-1.814-6.466 0-2.178.605-4.156 1.814-5.934 1.209-1.777 2.933-3.177 5.172-4.2 2.239-1.022 4.836-1.533 7.791-1.533 2.642 0 5.15.489 7.523 1.467 2.374.933 4.254 2.266 5.643 4 .447.622.671 1.089.671 1.4 0 .355-.179.689-.537 1-.313.266-.672.4-1.075.4-.358 0-.649-.134-.873-.4-1.254-1.6-2.866-2.867-4.836-3.8-1.97-.934-4.142-1.4-6.516-1.4-3.403 0-6.246.8-8.53 2.4-2.239 1.6-3.358 3.777-3.358 6.533 0 1.911.537 3.533 1.612 4.867 1.119 1.333 2.507 2.422 4.164 3.266 1.657.8 3.717 1.645 6.18 2.534 3.134 1.11 5.619 2.133 7.455 3.066 1.836.934 3.404 2.29 4.702 4.067 1.299 1.778 1.948 4.133 1.948 7.067 0 2.044-.604 3.955-1.813 5.733-1.209 1.778-2.956 3.2-5.24 4.267-2.239 1.022-4.813 1.533-7.724 1.533ZM483.657 20.667c.358 0 .671.133.94.4.269.222.403.51.403.866 0 .4-.134.711-.403.934-.224.222-.537.333-.94.333h-14.979V66c0 .356-.134.667-.403.933-.269.267-.582.4-.94.4-.403 0-.739-.133-1.008-.4a1.407 1.407 0 0 1-.336-.933V23.2h-14.979c-.358 0-.671-.111-.94-.333a1.273 1.273 0 0 1-.403-.934c0-.355.134-.644.403-.866.269-.267.582-.4.94-.4h32.645Z"
                    fill="#fff"
                  />
                  {/* <path
                  stroke="#6366F1"
                  strokeWidth="8"
                  strokeLinecap="round"
                  d="M4 4v80M20 13v62M36 23v42M52 33v22M68 43v2"
                /> */}
                  <g>
                    <line
                      x1="4"
                      y1="4"
                      x2="4"
                      y2="84"
                      stroke="#6366F1"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <line
                      x1="20"
                      y1="13"
                      x2="20"
                      y2="75"
                      stroke="#6366F1"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <line
                      x1="36"
                      y1="23"
                      x2="36"
                      y2="65"
                      stroke="#6366F1"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <line
                      x1="52"
                      y1="33"
                      x2="52"
                      y2="55"
                      stroke="#6366F1"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <line
                      x1="68"
                      y1="43"
                      x2="68"
                      y2="45"
                      stroke="#6366F1"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
              </a>
            </Link>
            {/* <span className="inline-block bg-amber-100 px-2 py-1 rounded-md shadow-sm shadow-amber-300 uppercase font-bold text-xs text-slate-800">
              Beta
            </span> */}
            {user && (
              <nav className="ml-4">
                <ul className="flex gap-4">
                  {menuItems.map((item) => {
                    const isCurrent = asPath === item.href;
                    return (
                      <li key={item.title}>
                        <Link href={item.href}>
                          <a
                            className="py-1 px-3 inline-block rounded-md hover:bg-indigo-600 transition-colors font-semibold"
                            aria-current={isCurrent ? 'page' : 'false'}
                          >
                            {item.title}
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            {(user && (
              <>
                {(user.picture && (
                  <div className="rounded-full overflow-hidden w-8 h-8">
                    <Image
                      src={user.picture}
                      alt={user.name || ''}
                      height="32"
                      width="32"
                    />
                  </div>
                )) || <span className="user-name">{user.name}</span>}
                <a href="/api/auth/logout">
                  <IoLogOutOutline
                    title="Log out"
                    className="w-6 h-6 text-white"
                  />
                </a>
              </>
            )) || (
              <a href="/api/auth/login">
                <IoLogInOutline title="Log in" className="w-6 h-6 text-white" />
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}