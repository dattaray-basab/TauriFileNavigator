use crate::search::file_ops::search_file;
use crate::search::regex::build_regex;
use std::io::Write;
use tempfile::NamedTempFile;

#[test]
fn test_search_count_discrepancy() {
    // Create a temporary file with the exact content from the user's example
    let mut temp_file = NamedTempFile::new().unwrap();
    let file_content = r#"#!/bin/sh
#
# Copyright (c) 2006, 2008 Junio C Hamano
#
# The "pre-rebase" hook is run just before "git rebase" starts doing
# its job, and can prevent the command from running by exiting with
# non-zero status.
#
# The hook is called with the following parameters:
#
# $1 -- the upstream the series was forked from.
# $2 -- the branch being rebased (or empty when rebasing the current branch).
#
# This sample shows how to prevent topic branches that are already
# merged to 'next' branch from getting rebased, because allowing it
# would result in rebasing already published history.

publish=next
basebranch="$1"
if test "$#" = 2
then
	topic="refs/heads/$2"
else
	topic=`git symbolic-ref HEAD` ||
	exit 0 ;# we do not interrupt rebasing detached HEAD
fi

case "$topic" in
refs/heads/??/*)
	;;
*)
	exit 0 ;# we do not interrupt others.
	;;
esac

# Now we are dealing with a topic branch being rebased
# on top of master.  Is it OK to rebase it?

# Does the topic really exist?
git show-ref -q "$topic" || {
	echo >&2 "No such branch $topic"
	exit 1
}

# Is topic fully merged to master?
not_in_master=`git rev-list --pretty=oneline ^master "$topic"`
if test -z "$not_in_master"
then
	echo >&2 "$topic is fully merged to master; better remove it."
	exit 1 ;# we could allow it, but there is no point.
fi

# Is topic ever merged to next?  If so you should not be rebasing it.
only_next_1=`git rev-list ^master "^$topic" ${publish} | sort`
only_next_2=`git rev-list ^master           ${publish} | sort`
if test "$only_next_1" = "$only_next_2"
then
	not_in_topic=`git rev-list "^$topic" master`
	if test -z "$not_in_topic"
	then
		echo >&2 "$topic is already up to date with master"
		exit 1 ;# we could allow it, but there is no point.
	else
		exit 0
	fi
else
	not_in_next=`git rev-list --pretty=oneline ^${publish} "$topic"`
	/usr/bin/perl -e '
		my $topic = $ARGV[0];
		my $msg = "* $topic has commits already merged to public branch:\n";
		my (%not_in_next) = map {
			/^([0-9a-f]+) /;
			($1 => 1);
		} split(/\n/, $ARGV[1]);
		for my $elem (map {
				/^([0-9a-f]+) (.*)$/;
				[$1 => $2];
			} split(/\n/, $ARGV[2])) {
			if (!exists $not_in_next{$elem->[0]}) {
				if ($msg) {
					print STDERR $msg;
					undef $msg;
				}
				print STDERR " $elem->[1]\n";
			}
		}
	' "$topic" "$not_in_next" "$not_in_master"
	exit 1
fi

<<\DOC_END

This sample hook safeguards topic branches that have been
published from being rewound.

The workflow assumed here is:

 * Once a topic branch forks from "master", "master" is never
   merged into it again (either directly or indirectly).

 * Once a topic branch is fully cooked and merged into "master",
   it is deleted.  If you need to build on top of it to correct
   earlier mistakes, a new topic branch is created by forking at
   the tip of the "master".  This is not strictly necessary, but
   it makes it easier to keep your history simple.

 * Whenever you need to test or publish your changes to topic
   branches, merge them into "next" branch.

The script, being an example, hardcodes the publish branch name
to be "next", but it is trivial to make it configurable via
$GIT_DIR/config mechanism.

With this workflow, you would want to know:

(1) ... if a topic branch has ever been merged to "next".  Young
   topic branches can have stupid mistakes you would rather
   clean up before publishing, and things that have not been
   merged into other branches can be easily rebased without
   affecting other people.  But once it is published, you would
   not want to rewind it.

(2) ... if a topic branch has been fully merged to "master".
   Then you can delete it.  More importantly, you should not
   build on top of it -- other people may already want to
   change things related to the topic as patches against your
   "master", so if you need further changes, it is better to
   fork the topic (perhaps with the same name) afresh from the
   tip of "master".

Let's look at this example:

		   o---o---o---o---o---o---o---o---o---o "next"
		  /       /           /           /
		 /   a---a---b A     /           /
		/   /               /           /
	       /   /   c---c---c---c B         /
	      /   /   /             \         /
	     /   /   /   b---b C     \       /
	    /   /   /   /             \     /
    ---o---o---o---o---o---o---o---o---o---o---o "master"


A, B and C are topic branches.

 * A has one fix since it was merged up to "next".

 * B has finished.  It has been fully merged up to "master" and "next",
   and is ready to be deleted.

 * C has not merged to "next" at all.

We would want to allow C to be rebased, refuse A, and encourage
B to be deleted.

To compute (1):

	git rev-list ^master ^topic next
	git rev-list ^master        next

	if these match, topic has not merged in next at all.

To compute (2):

	git rev-list master..topic

	if this is empty, it is fully merged to "master".

DOC_END
"#;

    temp_file.write_all(file_content.as_bytes()).unwrap();
    let path = temp_file.path();

    // Create a regex for searching "next" (case-sensitive)
    let regex = build_regex("next", false, true, false).unwrap();

    // Search the file
    let result = search_file(path, &regex);

    // Verify the result
    assert!(result.is_some(), "Search should find matches");

    let search_result = result.unwrap();

    // Count total matches
    let total_matches = search_result
        .matches
        .iter()
        .map(|m| m.match_ranges.len())
        .sum::<usize>();

    // The expected count is 21 (as reported by the user)
    assert_eq!(
        total_matches, 21,
        "Expected 21 matches for 'next' in the file"
    );

    // Print the matches for debugging
    println!("Found {} matches for 'next' in the file", total_matches);
    for (_i, m) in search_result.matches.iter().enumerate() {
        println!("Line {}: {} matches", m.line, m.match_ranges.len());
    }
}

#[test]
fn test_search_count_with_different_options() {
    // Create a temporary file with the exact content from the user's example
    let mut temp_file = NamedTempFile::new().unwrap();
    let file_content = r#"#!/bin/sh
#
# Copyright (c) 2006, 2008 Junio C Hamano
#
# The "pre-rebase" hook is run just before "git rebase" starts doing
# its job, and can prevent the command from running by exiting with
# non-zero status.
#
# The hook is called with the following parameters:
#
# $1 -- the upstream the series was forked from.
# $2 -- the branch being rebased (or empty when rebasing the current branch).
#
# This sample shows how to prevent topic branches that are already
# merged to 'next' branch from getting rebased, because allowing it
# would result in rebasing already published history.

publish=next
basebranch="$1"
if test "$#" = 2
then
	topic="refs/heads/$2"
else
	topic=`git symbolic-ref HEAD` ||
	exit 0 ;# we do not interrupt rebasing detached HEAD
fi

case "$topic" in
refs/heads/??/*)
	;;
*)
	exit 0 ;# we do not interrupt others.
	;;
esac

# Now we are dealing with a topic branch being rebased
# on top of master.  Is it OK to rebase it?

# Does the topic really exist?
git show-ref -q "$topic" || {
	echo >&2 "No such branch $topic"
	exit 1
}

# Is topic fully merged to master?
not_in_master=`git rev-list --pretty=oneline ^master "$topic"`
if test -z "$not_in_master"
then
	echo >&2 "$topic is fully merged to master; better remove it."
	exit 1 ;# we could allow it, but there is no point.
fi

# Is topic ever merged to next?  If so you should not be rebasing it.
only_next_1=`git rev-list ^master "^$topic" ${publish} | sort`
only_next_2=`git rev-list ^master           ${publish} | sort`
if test "$only_next_1" = "$only_next_2"
then
	not_in_topic=`git rev-list "^$topic" master`
	if test -z "$not_in_topic"
	then
		echo >&2 "$topic is already up to date with master"
		exit 1 ;# we could allow it, but there is no point.
	else
		exit 0
	fi
else
	not_in_next=`git rev-list --pretty=oneline ^${publish} "$topic"`
	/usr/bin/perl -e '
		my $topic = $ARGV[0];
		my $msg = "* $topic has commits already merged to public branch:\n";
		my (%not_in_next) = map {
			/^([0-9a-f]+) /;
			($1 => 1);
		} split(/\n/, $ARGV[1]);
		for my $elem (map {
				/^([0-9a-f]+) (.*)$/;
				[$1 => $2];
			} split(/\n/, $ARGV[2])) {
			if (!exists $not_in_next{$elem->[0]}) {
				if ($msg) {
					print STDERR $msg;
					undef $msg;
				}
				print STDERR " $elem->[1]\n";
			}
		}
	' "$topic" "$not_in_next" "$not_in_master"
	exit 1
fi

<<\DOC_END

This sample hook safeguards topic branches that have been
published from being rewound.

The workflow assumed here is:

 * Once a topic branch forks from "master", "master" is never
   merged into it again (either directly or indirectly).

 * Once a topic branch is fully cooked and merged into "master",
   it is deleted.  If you need to build on top of it to correct
   earlier mistakes, a new topic branch is created by forking at
   the tip of the "master".  This is not strictly necessary, but
   it makes it easier to keep your history simple.

 * Whenever you need to test or publish your changes to topic
   branches, merge them into "next" branch.

The script, being an example, hardcodes the publish branch name
to be "next", but it is trivial to make it configurable via
$GIT_DIR/config mechanism.

With this workflow, you would want to know:

(1) ... if a topic branch has ever been merged to "next".  Young
   topic branches can have stupid mistakes you would rather
   clean up before publishing, and things that have not been
   merged into other branches can be easily rebased without
   affecting other people.  But once it is published, you would
   not want to rewind it.

(2) ... if a topic branch has been fully merged to "master".
   Then you can delete it.  More importantly, you should not
   build on top of it -- other people may already want to
   change things related to the topic as patches against your
   "master", so if you need further changes, it is better to
   fork the topic (perhaps with the same name) afresh from the
   tip of "master".

Let's look at this example:

		   o---o---o---o---o---o---o---o---o---o "next"
		  /       /           /           /
		 /   a---a---b A     /           /
		/   /               /           /
	       /   /   c---c---c---c B         /
	      /   /   /             \         /
	     /   /   /   b---b C     \       /
	    /   /   /   /             \     /
    ---o---o---o---o---o---o---o---o---o---o---o "master"


A, B and C are topic branches.

 * A has one fix since it was merged up to "next".

 * B has finished.  It has been fully merged up to "master" and "next",
   and is ready to be deleted.

 * C has not merged to "next" at all.

We would want to allow C to be rebased, refuse A, and encourage
B to be deleted.

To compute (1):

	git rev-list ^master ^topic next
	git rev-list ^master        next

	if these match, topic has not merged in next at all.

To compute (2):

	git rev-list master..topic

	if this is empty, it is fully merged to "master".

DOC_END
"#;

    temp_file.write_all(file_content.as_bytes()).unwrap();
    let path = temp_file.path();

    // Test with different search options
    let test_cases = vec![
        ("next", true, false, 21),  // Case-sensitive, non-regex
        ("next", false, false, 21), // Case-insensitive, non-regex
        ("next", true, true, 13),   // Case-sensitive, whole word (only matches standalone "next")
        ("next", false, true, 13),  // Case-insensitive, whole word (only matches standalone "next")
    ];

    for (query, is_case_sensitive, is_whole_word, expected_count) in test_cases {
        let regex = build_regex(query, false, is_case_sensitive, is_whole_word).unwrap();
        let result = search_file(path, &regex);

        assert!(
            result.is_some(),
            "Search should find matches for query '{}'",
            query
        );

        let search_result = result.unwrap();
        let total_matches = search_result
            .matches
            .iter()
            .map(|m| m.match_ranges.len())
            .sum::<usize>();

        assert_eq!(
            total_matches, expected_count,
            "Expected {} matches for '{}' with case_sensitive={}, whole_word={}",
            expected_count, query, is_case_sensitive, is_whole_word
        );

        // Print matches for debugging
        println!(
            "\nFound {} matches for '{}' with case_sensitive={}, whole_word={}",
            total_matches, query, is_case_sensitive, is_whole_word
        );
        for (_i, m) in search_result.matches.iter().enumerate() {
            println!(
                "Line {}: {} matches - '{}'",
                m.line,
                m.match_ranges.len(),
                m.content.trim()
            );
        }
    }
}
