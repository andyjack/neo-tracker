#!/usr/bin/env perl

use strict;
use warnings;
no warnings 'experimental';
use autodie;
use feature 'say', 'postderef';

use DateTime;
use Text::CSV;

open my $fh, '<', $ARGV[0];
my $csv = Text::CSV->new( { binary => 1 } );
my $head = $csv->getline($fh); # skip header
say join(",",qw( Date Close ));
while ( my $row = $csv->getline($fh) ) {
    #next if $row->[1] eq 'N/A';
    my ($month,$day,$year) = split('/',$row->[0]);
    $year += 2000;
    my $dt = DateTime->new(month => $month, day => $day, year => $year);
    say $dt->strftime('%Y-%m-%d'),",",$row->[4];
}
